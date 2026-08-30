let lastItemId = null;

const RANDOM_ITEM_API_URL =
  "https://issaku-ichie-api.randomvideo-contact2026.workers.dev/";

const randomButton = document.querySelector("#randomButton");
const title = document.querySelector("#title");
const price = document.querySelector("#price");
const genre = document.querySelector("#genre");
const message = document.querySelector("#message");
const productImage = document.querySelector("#productImage");
const productLink = document.querySelector("#productLink");
const product = document.querySelector(".product");

const resetButton = document.querySelector("#resetButton");

const selectedTagName =
  document.querySelector("#selectedTagName");

const tagSelectLink =
  document.querySelector("#tagSelectLink");

const selectedActressName =
  document.querySelector("#selectedActressName");

const actressSelectLink =
  document.querySelector("#actressSelectLink");

const navAllLink =
  document.querySelector("#navAllLink");

const nav2dLink =
  document.querySelector("#nav2dLink");

const navVrLink =
  document.querySelector("#navVrLink");

const navTagsLink =
  document.querySelector("#navTagsLink");

const navActressesLink =
  document.querySelector("#navActressesLink");

const typeIndicator =
  document.querySelector("#typeIndicator");

const ageGate =
  document.querySelector("#ageGate");

const ageConfirmButton =
  document.querySelector("#ageConfirmButton");

const mainContent =
  document.querySelector("#mainContent");


// =========================
// 登録済み作品チェック
// =========================

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateItems() {
  const usedIds = new Set();

  items.forEach((item, index) => {
    const itemNumber = index + 1;

    if (!item.id) {
      console.error(
        `作品${itemNumber}：idがありません`
      );
    } else if (usedIds.has(item.id)) {
      console.error(
        `作品${itemNumber}：id「${item.id}」が重複しています`
      );
    } else {
      usedIds.add(item.id);
    }

    if (!item.title) {
      console.error(
        `作品${itemNumber}：titleがありません`
      );
    }

    if (typeof item.price !== "number") {
      console.error(
        `作品${itemNumber}：priceは数字で入力してください`
      );
    }

    if (
      !Array.isArray(item.genres) ||
      item.genres.length === 0
    ) {
      console.error(
        `作品${itemNumber}：genresは1個以上のタグを含む配列にしてください`
      );
    }

    if (!item.image) {
      console.error(
        `作品${itemNumber}：imageがありません`
      );
    } else if (!isValidUrl(item.image)) {
      console.error(
        `作品${itemNumber}：imageのURLが正しくありません`
      );
    }

    if (!item.url) {
      console.error(
        `作品${itemNumber}：urlがありません`
      );
    } else if (!isValidUrl(item.url)) {
      console.error(
        `作品${itemNumber}：urlの形式が正しくありません`
      );
    }
  });
}

validateItems();


// =========================
// URLから条件を取得
// =========================

const urlParams =
  new URLSearchParams(
    window.location.search
  );

let selectedTags =
  urlParams
    .getAll("tag")
    .filter(Boolean)
    .slice(0, 3);

let selectedActresses =
  urlParams
    .getAll("actress")
    .filter(Boolean)
    .slice(0, 3);

const typeFromUrl =
  urlParams.get("type");

let selectedType = null;

if (
  typeFromUrl === "2d" ||
  typeFromUrl === "vr"
) {
  selectedType = typeFromUrl;
}


// =========================
// 2D / VR 表示
// =========================

function updateTypeDisplay() {
  navAllLink.classList.remove(
    "active-type"
  );

  nav2dLink.classList.remove(
    "active-type"
  );

  navVrLink.classList.remove(
    "active-type"
  );

  typeIndicator.classList.remove(
    "is-2d",
    "is-vr"
  );

  if (selectedType === "2d") {
    nav2dLink.classList.add(
      "active-type"
    );

    typeIndicator.textContent =
      "現在：2D版を表示中";

    typeIndicator.classList.add(
      "is-2d"
    );

  } else if (selectedType === "vr") {
    navVrLink.classList.add(
      "active-type"
    );

    typeIndicator.textContent =
      "現在：VR版を表示中";

    typeIndicator.classList.add(
      "is-vr"
    );

  } else {
    navAllLink.classList.add(
      "active-type"
    );

    typeIndicator.textContent =
      "現在：2D / VR 共通版を表示中";
  }

  typeIndicator.hidden = false;
}


// =========================
// 選択中タグ表示
// =========================

function updateSelectedTagDisplay() {
  if (selectedTags.length > 0) {
    selectedTagName.textContent =
      selectedTags.join(" / ");

    tagSelectLink.textContent =
      "タグを変更する";
  } else {
    selectedTagName.textContent =
      "指定なし";

    tagSelectLink.textContent =
      "タグを選ぶ";
  }
}


// =========================
// 選択中女優表示
// =========================

function updateSelectedActressDisplay() {
  if (selectedActresses.length > 0) {
    selectedActressName.textContent =
      selectedActresses.join(" / ");

    actressSelectLink.textContent =
      "女優を変更する";
  } else {
    selectedActressName.textContent =
      "指定なし";

    actressSelectLink.textContent =
      "女優を選ぶ";
  }
}


// =========================
// 作品表示リセット
// =========================

function resetProductDisplay() {
  productImage.src =
    "https://placehold.co/1280x720?text=Random+Video";

  productImage.alt = "作品画像";

  title.textContent =
    "ボタンを押すと作品が表示されます。";

  price.textContent = "";
  genre.textContent = "";
  message.textContent = "";

  productLink.hidden = true;

  randomButton.textContent =
    "作品を探す";
}


// =========================
// APIからランダム作品取得
// =========================

async function fetchRandomItemFromApi() {
  const apiUrl =
    new URL(RANDOM_ITEM_API_URL);

  selectedActresses.forEach(
    (actress) => {
      apiUrl.searchParams.append(
        "actress",
        actress
      );
    }
  );

  selectedTags.forEach((tag) => {
    apiUrl.searchParams.append(
      "genre",
      tag
    );
  });

  if (selectedType) {
    apiUrl.searchParams.set(
      "type",
      selectedType
    );
  }

  const response =
    await fetch(
      apiUrl.toString(),
      {
        method: "GET",
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      `作品取得APIエラー: ${response.status}`
    );
  }

  const data =
    await response.json();

  return {
    item:
      data.item ?? null,

    confirmedEmpty:
      data.confirmedEmpty ?? null,
  };
}


// =========================
// 通信エラー時のローカル絞り込み
// =========================

function getFilteredItems() {
  return items.filter((item) => {
    const itemGenres =
      Array.isArray(item.genres)
        ? item.genres
        : [];

    const itemActresses =
      Array.isArray(item.actresses)
        ? item.actresses
        : [];

    const matchesTags =
      selectedTags.every(
        (tag) =>
          itemGenres.includes(tag)
      );

    const matchesActresses =
      selectedActresses.every(
        (actress) =>
          itemActresses.includes(
            actress
          )
      );

    const matchesType =
      !selectedType ||
      item.type === selectedType;

    return (
      matchesTags &&
      matchesActresses &&
      matchesType
    );
  });
}


// =========================
// 作品表示
// =========================

function displayItem(selectedItem) {
  lastItemId =
    selectedItem.id;

  title.textContent =
    selectedItem.title;

  if (
    typeof selectedItem.price ===
    "number"
  ) {
    price.textContent =
      `価格：${selectedItem.price.toLocaleString("ja-JP")}円`;
  } else {
    price.textContent =
      "価格：情報なし";
  }

  const itemGenres =
    Array.isArray(selectedItem.genres)
      ? selectedItem.genres
      : [];

  genre.textContent =
    `ジャンル：${itemGenres.join(" / ")}`;

  message.textContent = "";

  productImage.src =
    selectedItem.image;

  productImage.alt =
    selectedItem.title;

  productLink.href =
    selectedItem.url;

  productLink.hidden = false;

  randomButton.textContent =
    "別の作品を見る";
}


// =========================
// 作品を探す
// =========================

async function showRandomItem() {
  randomButton.disabled = true;

  product.classList.add(
    "fade-out"
  );

  try {
    await new Promise(
      (resolve) => {
        setTimeout(
          resolve,
          250
        );
      }
    );

    const result =
      await fetchRandomItemFromApi();

    const selectedItem =
      result.item;

    const confirmedEmpty =
      result.confirmedEmpty;

    if (selectedItem === null) {
      if (
        confirmedEmpty === true
      ) {
        title.textContent =
          "該当する作品は存在しません";
      } else {
        title.textContent =
          "作品を取得できませんでした";
      }

      price.textContent = "";
      genre.textContent = "";
      message.textContent = "";

      productLink.hidden = true;

      return;
    }

    displayItem(selectedItem);

  } catch (error) {
    console.error(
      "作品の取得に失敗しました:",
      error
    );

    const fallbackItems =
      getFilteredItems();

    if (
      fallbackItems.length === 0
    ) {
      title.textContent =
        "作品を取得できませんでした";

      price.textContent = "";
      genre.textContent = "";

      message.textContent =
        "時間をおいて、もう一度お試しください。";

      productLink.hidden = true;

    } else {
      let fallbackItem;

      do {
        const randomNumber =
          Math.floor(
            Math.random() *
            fallbackItems.length
          );

        fallbackItem =
          fallbackItems[
            randomNumber
          ];

      } while (
        fallbackItem.id ===
          lastItemId &&
        fallbackItems.length > 1
      );

      displayItem(
        fallbackItem
      );

      message.textContent =
        "通信エラーのため、登録済み作品から表示しています。";
    }

  } finally {
    product.classList.remove(
      "fade-out"
    );

    randomButton.disabled = false;
  }
}


// =========================
// 条件URL生成
// =========================

function addSelectedTags(params) {
  selectedTags.forEach(
    (tag) => {
      params.append(
        "tag",
        tag
      );
    }
  );
}

function addSelectedActresses(
  params
) {
  selectedActresses.forEach(
    (actress) => {
      params.append(
        "actress",
        actress
      );
    }
  );
}


// =========================
// 各リンクの条件保持
// =========================

function updateFilterLinks() {

  // タグ一覧
  const tagParams =
    new URLSearchParams();

  addSelectedTags(tagParams);
  addSelectedActresses(tagParams);

  if (selectedType) {
    tagParams.set(
      "type",
      selectedType
    );
  }

  const tagQuery =
    tagParams.toString();

  tagSelectLink.href =
    tagQuery
      ? `tags.html?${tagQuery}`
      : "tags.html";

  navTagsLink.href =
    tagSelectLink.href;


  // 女優検索
  const actressParams =
    new URLSearchParams();

  addSelectedTags(
    actressParams
  );

  addSelectedActresses(
    actressParams
  );

  if (selectedType) {
    actressParams.set(
      "type",
      selectedType
    );
  }

  const actressQuery =
    actressParams.toString();

  actressSelectLink.href =
    actressQuery
      ? `actresses.html?${actressQuery}`
      : "actresses.html";

  navActressesLink.href =
    actressSelectLink.href;


  // 2D / VR
  const typeParams =
    new URLSearchParams();

  addSelectedTags(
    typeParams
  );

  addSelectedActresses(
    typeParams
  );


  // 共通
  const allQuery =
    typeParams.toString();

  navAllLink.href =
    allQuery
      ? `index.html?${allQuery}`
      : "index.html";


  // 2D
  const twoDParams =
    new URLSearchParams(
      typeParams
    );

  twoDParams.set(
    "type",
    "2d"
  );

  nav2dLink.href =
    `index.html?${twoDParams.toString()}`;


  // VR
  const vrParams =
    new URLSearchParams(
      typeParams
    );

  vrParams.set(
    "type",
    "vr"
  );

  navVrLink.href =
    `index.html?${vrParams.toString()}`;
}


// =========================
// 条件リセット
// =========================

resetButton.addEventListener(
  "click",
  () => {
    selectedTags = [];
    selectedActresses = [];
    selectedType = null;

    window.history.replaceState(
      {},
      "",
      "index.html"
    );

    lastItemId = null;

    updateSelectedTagDisplay();
    updateSelectedActressDisplay();
    updateTypeDisplay();
    updateFilterLinks();
    resetProductDisplay();
  }
);


// =========================
// 検索ボタン
// =========================

randomButton.addEventListener(
  "click",
  showRandomItem
);


// =========================
// 画像エラー
// =========================

productImage.addEventListener(
  "error",
  () => {
    productImage.src =
      "https://placehold.co/1280x720/f3eadc/594d40?text=Image+Not+Found";

    productImage.alt =
      "画像を読み込めませんでした";
  }
);


// =========================
// 年齢確認
// =========================

const ageConfirmed =
  sessionStorage.getItem(
    "ageConfirmed"
  );

if (ageConfirmed === "true") {
  ageGate.hidden = true;
  mainContent.hidden = false;
}

ageConfirmButton.addEventListener(
  "click",
  () => {
    sessionStorage.setItem(
      "ageConfirmed",
      "true"
    );

    ageGate.hidden = true;
    mainContent.hidden = false;
  }
);


// =========================
// 初期表示
// =========================

updateSelectedTagDisplay();
updateSelectedActressDisplay();
updateTypeDisplay();
updateFilterLinks();