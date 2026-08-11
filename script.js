let lastItemId = null;

const randomButton = document.querySelector("#randomButton");
const title = document.querySelector("#title");
const price = document.querySelector("#price");
const genre = document.querySelector("#genre");
const message = document.querySelector("#message");
const productImage = document.querySelector("#productImage");
const productLink = document.querySelector("#productLink");
const product = document.querySelector(".product");

const priceSelect = document.querySelector("#priceSelect");
const resetButton = document.querySelector("#resetButton");
const resultCount = document.querySelector("#resultCount");

const selectedTagName = document.querySelector("#selectedTagName");
const tagSelectLink = document.querySelector("#tagSelectLink");

const nav2dLink = document.querySelector("#nav2dLink");
const navVrLink = document.querySelector("#navVrLink");
const typeIndicator = document.querySelector("#typeIndicator");
const navAllLink = document.querySelector("#navAllLink");

const navTagsLink = document.querySelector("#navTagsLink");
const navActressesLink = document.querySelector("#navActressesLink");

const selectedActressName =
  document.querySelector("#selectedActressName");

const actressSelectLink =
  document.querySelector("#actressSelectLink");

const ageGate = document.querySelector("#ageGate");
const ageConfirmButton = document.querySelector("#ageConfirmButton");
const mainContent = document.querySelector("#mainContent");

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
      console.error(`作品${itemNumber}：idがありません`);
    } else if (usedIds.has(item.id)) {
      console.error(
        `作品${itemNumber}：id「${item.id}」が重複しています`
      );
    } else {
      usedIds.add(item.id);
    }

    if (!item.title) {
      console.error(`作品${itemNumber}：titleがありません`);
    }

    if (typeof item.price !== "number") {
      console.error(
        `作品${itemNumber}：priceは数字で入力してください`
      );
    }

    if (!Array.isArray(item.genres) || item.genres.length === 0) {
      console.error(
        `作品${itemNumber}：genresは1個以上のタグを含む配列にしてください`
      );
    }

    if (!item.image) {
      console.error(`作品${itemNumber}：imageがありません`);
    } else if (!isValidUrl(item.image)) {
      console.error(
        `作品${itemNumber}：imageのURLが正しくありません`
      );
    }

    if (!item.url) {
      console.error(`作品${itemNumber}：urlがありません`);
    } else if (!isValidUrl(item.url)) {
      console.error(
        `作品${itemNumber}：urlの形式が正しくありません`
      );
    }
  });
}

validateItems();

const tags = [
  ...new Set(
    items.flatMap((item) =>
      Array.isArray(item.genres) ? item.genres : []
    )
  )
].sort((a, b) => a.localeCompare(b, "ja"));

const urlParams = new URLSearchParams(window.location.search);

const tagFromUrl = urlParams.get("tag");
const actressFromUrl = urlParams.get("actress");
const typeFromUrl = urlParams.get("type");

let selectedTag = null;
let selectedActress = null;
let selectedType = null;

if (tagFromUrl && tags.includes(tagFromUrl)) {
  selectedTag = tagFromUrl;
}
if (actressFromUrl) {
  selectedActress = actressFromUrl;
}
if (typeFromUrl === "2d" || typeFromUrl === "vr") {
  selectedType = typeFromUrl;
}

function updateTypeDisplay() {
  navAllLink.classList.remove("active-type");
  nav2dLink.classList.remove("active-type");
  navVrLink.classList.remove("active-type");

  typeIndicator.classList.remove("is-2d", "is-vr");

  if (selectedType === "2d") {
    nav2dLink.classList.add("active-type");

    typeIndicator.textContent =
      "現在：2D版を表示中";

    typeIndicator.classList.add("is-2d");
    typeIndicator.hidden = false;
  } else if (selectedType === "vr") {
    navVrLink.classList.add("active-type");

    typeIndicator.textContent =
      "現在：VR版を表示中";

    typeIndicator.classList.add("is-vr");
    typeIndicator.hidden = false;
  } else {
    navAllLink.classList.add("active-type");

    typeIndicator.textContent =
      "現在：2D / VR 共通版を表示中";

    typeIndicator.classList.remove("is-2d", "is-vr");
    typeIndicator.hidden = false;
  }
}

function updateSelectedTagDisplay() {
  if (selectedTag) {
    selectedTagName.textContent = selectedTag;
    tagSelectLink.textContent = "タグを変更する";
  } else {
    selectedTagName.textContent = "指定なし";
    tagSelectLink.textContent = "タグを選ぶ";
  }
}

function updateSelectedActressDisplay() {
  if (selectedActress) {
    selectedActressName.textContent = selectedActress;
    actressSelectLink.textContent = "女優を変更する";
  } else {
    selectedActressName.textContent = "指定なし";
    actressSelectLink.textContent = "女優を選ぶ";
  }
}

function getFilteredItems() {
  const selectedPrice = priceSelect.value;

  return items.filter((item) => {
    const tagMatches =
      selectedTag === null ||
      item.genres.includes(selectedTag);

    let priceMatches = false;

    if (selectedPrice === "all") {
      priceMatches = true;
    } else if (selectedPrice === "under1000") {
      priceMatches = item.price < 1000;
    } else if (selectedPrice === "1000to1999") {
      priceMatches =
        item.price >= 1000 && item.price < 2000;
    } else if (selectedPrice === "2000plus") {
      priceMatches = item.price >= 2000;
    }

    const actressMatches =
      selectedActress === null ||
      (Array.isArray(item.actresses) &&
        item.actresses.includes(selectedActress));

    const typeMatches =
      selectedType === null ||
      item.type === selectedType;

    return (
      tagMatches &&
      priceMatches &&
      actressMatches &&
      typeMatches
    );
  });
}

function updateResultCount() {
  const filteredItems = getFilteredItems();

  resultCount.textContent =
    `該当作品：${filteredItems.length}件`;
}

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
  randomButton.textContent = "作品を探す";
}

function showRandomItem() {
  randomButton.disabled = true;
  product.classList.add("fade-out");

  setTimeout(() => {
    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
      title.textContent = "該当する作品がありません";
      price.textContent = "";
      genre.textContent = "";

      message.textContent =
        "条件を変更して、もう一度お試しください。";

      productImage.src =
        "https://placehold.co/1280x720/f3eadc/594d40?text=No+Items";

      productImage.alt =
        "該当する作品がありません";

      productLink.hidden = true;

      product.classList.remove("fade-out");
      randomButton.disabled = false;

      return;
    }

    let selectedItem;

    do {
      const randomNumber = Math.floor(
        Math.random() * filteredItems.length
      );

      selectedItem = filteredItems[randomNumber];
    } while (
      selectedItem.id === lastItemId &&
      filteredItems.length > 1
    );

    lastItemId = selectedItem.id;

    title.textContent = selectedItem.title;

    price.textContent =
      `価格：${selectedItem.price.toLocaleString("ja-JP")}円`;

    genre.textContent =
      `ジャンル：${selectedItem.genres.join(" / ")}`;

    message.textContent = "";

    productImage.src = selectedItem.image;
    productImage.alt = selectedItem.title;

    productLink.href = selectedItem.url;
    productLink.hidden = false;

    randomButton.textContent = "別の作品を見る";

    product.classList.remove("fade-out");
    randomButton.disabled = false;
  }, 250);
}

randomButton.addEventListener("click", showRandomItem);

priceSelect.addEventListener("change", () => {
  lastItemId = null;
  updateResultCount();
});

resetButton.addEventListener("click", () => {
  selectedTag = null;
  selectedActress = null;
  selectedType = null;
  priceSelect.value = "all";

  if (selectedType) {
    window.history.replaceState(
      {},
      "",
      `index.html?type=${selectedType}`
    );
  } else {
    window.history.replaceState({}, "", "index.html");
  }

  lastItemId = null;

  updateSelectedTagDisplay();
  updateSelectedActressDisplay();
  updateTypeDisplay();
  updateFilterLinks();
  resetProductDisplay();
  updateResultCount();
});

productImage.addEventListener("error", () => {
  productImage.src =
    "https://placehold.co/1280x720/f3eadc/594d40?text=Image+Not+Found";

  productImage.alt =
    "画像を読み込めませんでした";
});

const ageConfirmed =
  sessionStorage.getItem("ageConfirmed");

if (ageConfirmed === "true") {
  ageGate.hidden = true;
  mainContent.hidden = false;
}

ageConfirmButton.addEventListener("click", () => {
  sessionStorage.setItem("ageConfirmed", "true");

  ageGate.hidden = true;
  mainContent.hidden = false;
});

updateSelectedTagDisplay();
updateSelectedActressDisplay();
updateTypeDisplay();

function updateFilterLinks() {
  const tagParams = new URLSearchParams();

  if (selectedActress) {
    tagParams.set("actress", selectedActress);
  }

  if (selectedType) {
    tagParams.set("type", selectedType);
  }

  const tagQuery = tagParams.toString();

  tagSelectLink.href =
    tagQuery ? `tags.html?${tagQuery}` : "tags.html";


  const actressParams = new URLSearchParams();

  if (selectedTag) {
    actressParams.set("tag", selectedTag);
  }

  if (selectedType) {
    actressParams.set("type", selectedType);
  }

  const actressQuery = actressParams.toString();

  actressSelectLink.href =
    actressQuery
      ? `actresses.html?${actressQuery}`
      : "actresses.html";

  if (selectedType) {
    navTagsLink.href = `tags.html?type=${selectedType}`;
    navActressesLink.href = `actresses.html?type=${selectedType}`;
  } else {
    navTagsLink.href = "tags.html";
    navActressesLink.href = "actresses.html";
  }
}

updateFilterLinks();
updateResultCount();

if (selectedTag) {
  showRandomItem();
}