let lastItemId = null;

const randomButton = document.querySelector("#randomButton");
const title = document.querySelector("#title");
const price = document.querySelector("#price");
const genre = document.querySelector("#genre");
const message = document.querySelector("#message");
const productImage = document.querySelector("#productImage");
const productLink = document.querySelector("#productLink");
const product = document.querySelector(".product");
const genreSelect = document.querySelector("#genreSelect");
const priceSelect = document.querySelector("#priceSelect");
const resetButton = document.querySelector("#resetButton");
const resultCount = document.querySelector("#resultCount");

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
      console.error(`作品${itemNumber}：id「${item.id}」が重複しています`);
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

    if (!item.genre) {
      console.error(`作品${itemNumber}：genreがありません`);
    }

   if (!item.image) {
  console.error(`作品${itemNumber}：imageがありません`);
} else if (!isValidUrl(item.image)) {
  console.error(`作品${itemNumber}：imageのURLが正しくありません`);
}

   if (!item.url) {
  console.error(`作品${itemNumber}：urlがありません`);
} else if (!isValidUrl(item.url)) {
  console.error(`作品${itemNumber}：urlの形式が正しくありません`);
}
});
}
validateItems();

const genres = [...new Set(items.map((item) => item.genre))].sort(
  (a, b) => a.localeCompare(b, "ja")
);

genres.forEach((genreName) => {
  const option = document.createElement("option");

  option.value = genreName;
  option.textContent = genreName;

  genreSelect.appendChild(option);
});


function getFilteredItems() {
  const selectedGenre = genreSelect.value;
  const selectedPrice = priceSelect.value;

  return items.filter((item) => {
    const genreMatches =
      selectedGenre === "all" || item.genre === selectedGenre;


    let priceMatches = false;

    if (selectedPrice === "all") {
      priceMatches = true;
    } else if (selectedPrice === "under1000") {
      priceMatches = item.price < 1000;
    } else if (selectedPrice === "1000to1999") {
      priceMatches = item.price >= 1000 && item.price < 2000;
    } else if (selectedPrice === "2000plus") {
       priceMatches = item.price >= 2000;
    }

    return genreMatches && priceMatches;
  });
}

function updateResultCount() {
  const filteredItems = getFilteredItems();

  resultCount.textContent = `該当作品：${filteredItems.length}件`;
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

  productImage.alt = "該当する作品がありません";

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
    genre.textContent = `ジャンル：${selectedItem.genre}`;
    message.textContent = "";

    productImage.src = selectedItem.image;
    productImage.alt = selectedItem.title;

    productLink.href = selectedItem.url;
    productLink.hidden = false;

    product.classList.remove("fade-out");
  }, 250);
    randomButton.disabled = false;
}

randomButton.addEventListener("click", showRandomItem);

genreSelect.addEventListener("change", () => {
 lastItemId = null;
  updateResultCount();
});

priceSelect.addEventListener("change", () => {
  lastItemId = null;
  updateResultCount();
});

resetButton.addEventListener("click", () => {
  // 絞り込み条件を「すべて」に戻す
  genreSelect.value = "all";
  priceSelect.value = "all";

  // 前回の抽選番号をリセットする
 lastItemId = null;

  // 画面を最初の状態に戻す
  productImage.src =
    "https://placehold.co/1280x720?text=Random+Video";
  productImage.alt = "作品画像";

  title.textContent = "ボタンを押すと作品が表示されます。";
  price.textContent = "";
  genre.textContent = "";
  message.textContent = "";

  productLink.hidden = true;

   updateResultCount();
});

updateResultCount();

productImage.addEventListener("error", () => {
  productImage.src =
    "https://placehold.co/1280x720/f3eadc/594d40?text=Image+Not+Found";

  productImage.alt = "画像を読み込めませんでした";
});

const ageConfirmed = sessionStorage.getItem("ageConfirmed");

if (ageConfirmed === "true") {
  ageGate.hidden = true;
  mainContent.hidden = false;
}

ageConfirmButton.addEventListener("click", () => {
  sessionStorage.setItem("ageConfirmed", "true");

  ageGate.hidden = true;
  mainContent.hidden = false;
});