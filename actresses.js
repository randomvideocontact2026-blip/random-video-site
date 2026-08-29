const ageGate = document.getElementById("ageGate");
const mainContent = document.getElementById("mainContent");
const ageConfirmButton = document.getElementById("ageConfirmButton");

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

const actressSearchInput = document.getElementById("actressSearchInput");
const actressResults = document.getElementById("actressResults");

const urlParams = new URLSearchParams(window.location.search);
const tagFromUrl = urlParams.get("tag");
const typeFromUrl = urlParams.get("type");

const navTagsLink = document.getElementById("navTagsLink");
const navActressesLink = document.getElementById("navActressesLink");

const navAllLink = document.getElementById("navAllLink");
const nav2dLink = document.getElementById("nav2dLink");
const navVrLink = document.getElementById("navVrLink");
const typeIndicator = document.getElementById("typeIndicator");

const navParams = new URLSearchParams();

if (tagFromUrl) {
  navParams.set("tag", tagFromUrl);
}

if (typeFromUrl === "2d" || typeFromUrl === "vr") {
  navParams.set("type", typeFromUrl);
}

const navQuery = navParams.toString();

navTagsLink.href = navQuery
  ? `tags.html?${navQuery}`
  : "tags.html";

navActressesLink.href = navQuery
  ? `actresses.html?${navQuery}`
  : "actresses.html";

function updateTypeDisplay() {
  navAllLink.classList.remove("active-type");
  nav2dLink.classList.remove("active-type");
  navVrLink.classList.remove("active-type");

  typeIndicator.classList.remove("is-2d", "is-vr");

  if (typeFromUrl === "2d") {
    nav2dLink.classList.add("active-type");
    typeIndicator.textContent = "現在：2D版を表示中";
    typeIndicator.classList.add("is-2d");
    typeIndicator.hidden = false;
  } else if (typeFromUrl === "vr") {
    navVrLink.classList.add("active-type");
    typeIndicator.textContent = "現在：VR版を表示中";
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

// 全作品から女優名だけを集める
const allActresses = [
  ...new Set(
    items.flatMap(item => item.actresses || [])
  )
].sort((a, b) => a.localeCompare(b, "ja"));

async function showActressResults(keyword = "") {
  actressResults.innerHTML = "";

  const trimmedKeyword = keyword.trim();

  // 何も入力されていないときは候補を表示しない
  if (trimmedKeyword === "") {
    return;
  }

  try {
    const apiUrl = new URL(
      "https://issaku-ichie-api.randomvideo-contact2026.workers.dev/"
    );

    apiUrl.searchParams.set("actresses", trimmedKeyword);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `女優検索APIエラー: ${response.status}`
      );
    }

    const data = await response.json();
    const matchedActresses = data.actresses ?? [];

    if (matchedActresses.length === 0) {
      const message = document.createElement("p");
      message.textContent = "該当する女優が見つかりません。";
      actressResults.appendChild(message);
      return;
    }

    matchedActresses.forEach((actress) => {
      const link = document.createElement("a");

      const params = new URLSearchParams();

      params.set("actress", actress.name);

      if (tagFromUrl) {
        params.set("tag", tagFromUrl);
      }

      if (typeFromUrl === "2d" || typeFromUrl === "vr") {
        params.set("type", typeFromUrl);
      }

      link.href = `index.html?${params.toString()}`;
      link.textContent = actress.name;

      actressResults.appendChild(link);
    });
  } catch (error) {
    console.error("女優検索に失敗しました:", error);

    const message = document.createElement("p");
    message.textContent = "女優検索に失敗しました。";
    actressResults.appendChild(message);
  }
}
actressSearchInput.addEventListener("input", () => {
  showActressResults(actressSearchInput.value);
});

updateTypeDisplay();