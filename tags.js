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


const GENRES_API_URL =
  "https://issaku-ichie-api.randomvideo-contact2026.workers.dev/?genres=1";

async function fetchGenres() {
  const response = await fetch(GENRES_API_URL, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ジャンル取得失敗: ${response.status}`);
  }

  const data = await response.json();

  return data.genres ?? [];
}


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


// APIからタグ一覧を取得して画面に表示
async function displayTags() {
  try {
    const genres = await fetchGenres();

    const tags = genres
      .map((genre) => genre.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "ja"));

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
  } catch (error) {
    console.error("タグ一覧の取得に失敗しました:", error);

    tagList.textContent =
      "タグ一覧を取得できませんでした。";
  }
}


// 2D / VR 表示を更新
updateTypeDisplay();

// タグ一覧を表示
displayTags();