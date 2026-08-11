const ageGate = document.getElementById("ageGate");
const ageConfirmButton = document.getElementById("ageConfirmButton");
const mainContent = document.getElementById("mainContent");
const tagList = document.getElementById("tagList");

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


// URLから条件を取得
const urlParams = new URLSearchParams(window.location.search);

const actressFromUrl = urlParams.get("actress");
const typeFromUrl = urlParams.get("type");


// 上部ナビを取得
const navTagsLink = document.getElementById("navTagsLink");
const navActressesLink = document.getElementById("navActressesLink");

const navAllLink = document.getElementById("navAllLink");
const nav2dLink = document.getElementById("nav2dLink");
const navVrLink = document.getElementById("navVrLink");
const typeIndicator = document.getElementById("typeIndicator");


// 2D / VR に応じて対象作品を絞る
const targetItems =
  typeFromUrl === "2d" || typeFromUrl === "vr"
    ? items.filter((item) => item.type === typeFromUrl)
    : items;


// 対象作品からタグ一覧を作る
const tags = [
  ...new Set(
    targetItems.flatMap((item) => item.genres)
  )
].sort((a, b) => a.localeCompare(b, "ja"));


// 2D / VR をページ移動時にも保持
if (typeFromUrl === "2d" || typeFromUrl === "vr") {
  navTagsLink.href = `tags.html?type=${typeFromUrl}`;
  navActressesLink.href =
    `actresses.html?type=${typeFromUrl}`;
}


// 2D / VR の選択状態を表示
function updateTypeDisplay() {
  navAllLink.classList.remove("active-type");
  nav2dLink.classList.remove("active-type");
  navVrLink.classList.remove("active-type");

  typeIndicator.classList.remove("is-2d", "is-vr");

  if (typeFromUrl === "2d") {
    nav2dLink.classList.add("active-type");

    typeIndicator.textContent =
      "現在：2D版を表示中";

    typeIndicator.classList.add("is-2d");
    typeIndicator.hidden = false;

  } else if (typeFromUrl === "vr") {
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


// タグを画面に表示
tags.forEach((tag) => {
  const tagLink = document.createElement("a");

  tagLink.textContent = tag;

  const params = new URLSearchParams();

  params.set("tag", tag);

  if (actressFromUrl) {
    params.set("actress", actressFromUrl);
  }

  if (typeFromUrl === "2d" || typeFromUrl === "vr") {
    params.set("type", typeFromUrl);
  }

  tagLink.href =
    `index.html?${params.toString()}`;

  tagList.appendChild(tagLink);
});


// 2D / VR 表示を更新
updateTypeDisplay();