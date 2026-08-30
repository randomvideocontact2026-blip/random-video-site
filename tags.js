const ageGate = document.getElementById("ageGate");
const ageConfirmButton = document.getElementById("ageConfirmButton");
const mainContent = document.getElementById("mainContent");
const tagList = document.getElementById("tagList");

const selectedTagsContainer = document.getElementById("selectedTags");
const selectedTagCount = document.getElementById("selectedTagCount");
const applyTagsButton = document.getElementById("applyTagsButton");
const clearTagsButton = document.getElementById("clearTagsButton");

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


// =========================
// URLから条件を取得
// =========================

const urlParams = new URLSearchParams(window.location.search);

const actressesFromUrl = urlParams
  .getAll("actress")
  .filter(Boolean)
  .slice(0, 3);

const typeFromUrl = urlParams.get("type");

const selectedTags = urlParams
  .getAll("tag")
  .filter(Boolean)
  .slice(0, 3);


// =========================
// 上部ナビ
// =========================

const navTagsLink = document.getElementById("navTagsLink");
const navActressesLink = document.getElementById("navActressesLink");

const navAllLink = document.getElementById("navAllLink");
const nav2dLink = document.getElementById("nav2dLink");
const navVrLink = document.getElementById("navVrLink");

const typeIndicator = document.getElementById("typeIndicator");


// =========================
// API
// =========================

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


// =========================
// 共通URL生成
// =========================

function createConditionParams() {
  const params = new URLSearchParams();

  selectedTags.forEach((tag) => {
    params.append("tag", tag);
  });

  actressesFromUrl.forEach((actress) => {
    params.append("actress", actress);
  });

  if (typeFromUrl === "2d" || typeFromUrl === "vr") {
    params.set("type", typeFromUrl);
  }

  return params;
}


// =========================
// ナビURLを更新
// =========================

function updateNavigationLinks() {
  const commonParams = new URLSearchParams();

  selectedTags.forEach((tag) => {
    commonParams.append("tag", tag);
  });

  actressesFromUrl.forEach((actress) => {
    commonParams.append("actress", actress);
  });


  // 共通
  const allParams = new URLSearchParams(commonParams);

  navAllLink.href =
    allParams.toString()
      ? `tags.html?${allParams.toString()}`
      : "tags.html";


  // 2D
  const params2d = new URLSearchParams(commonParams);
  params2d.set("type", "2d");

  nav2dLink.href =
    `tags.html?${params2d.toString()}`;


  // VR
  const paramsVr = new URLSearchParams(commonParams);
  paramsVr.set("type", "vr");

  navVrLink.href =
    `tags.html?${paramsVr.toString()}`;


  // タグ一覧
  navTagsLink.href =
    window.location.pathname.split("/").pop()
      ? `tags.html?${createConditionParams().toString()}`
      : "tags.html";


  // 女優検索
  const actressParams = createConditionParams();

  navActressesLink.href =
    actressParams.toString()
      ? `actresses.html?${actressParams.toString()}`
      : "actresses.html";
}


// =========================
// 2D / VR 表示
// =========================

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

  } else if (typeFromUrl === "vr") {
    navVrLink.classList.add("active-type");

    typeIndicator.textContent =
      "現在：VR版を表示中";

    typeIndicator.classList.add("is-vr");

  } else {
    navAllLink.classList.add("active-type");

    typeIndicator.textContent =
      "現在：2D / VR 共通版を表示中";
  }

  typeIndicator.hidden = false;
}


// =========================
// 選択中タグ表示
// =========================

function updateSelectedTagsDisplay() {
  selectedTagsContainer.innerHTML = "";

  selectedTagCount.textContent = selectedTags.length;

  if (selectedTags.length === 0) {
    const emptyMessage = document.createElement("span");

    emptyMessage.className = "no-selected-tags";
    emptyMessage.textContent =
      "まだタグを選択していません。";

    selectedTagsContainer.appendChild(emptyMessage);

    applyTagsButton.disabled = true;

    return;
  }

  selectedTags.forEach((tag) => {
    const tagChip = document.createElement("button");

    tagChip.type = "button";
    tagChip.className = "selected-tag-chip";
    tagChip.textContent = `${tag} ×`;

    tagChip.addEventListener("click", () => {
      const index = selectedTags.indexOf(tag);

      if (index !== -1) {
        selectedTags.splice(index, 1);
      }

      updateSelectedTagsDisplay();
      updateTagButtonStates();
      updateNavigationLinks();
    });

    selectedTagsContainer.appendChild(tagChip);
  });

  applyTagsButton.disabled = false;
}


// =========================
// タグの選択状態更新
// =========================

function updateTagButtonStates() {
  const tagButtons =
    tagList.querySelectorAll("[data-tag]");

  tagButtons.forEach((button) => {
    const tag = button.dataset.tag;

    const isSelected =
      selectedTags.includes(tag);

    button.classList.toggle(
      "is-selected",
      isSelected
    );

    button.setAttribute(
      "aria-pressed",
      String(isSelected)
    );
  });
}


// =========================
// タグ一覧表示
// =========================

async function displayTags() {
  try {
    const genres = await fetchGenres();

    const tags = genres
      .map((genre) => genre.name)
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b, "ja")
      );

    tagList.innerHTML = "";

    tags.forEach((tag) => {
      const tagButton =
        document.createElement("button");

      tagButton.type = "button";
      tagButton.className = "tag-choice";
      tagButton.dataset.tag = tag;
      tagButton.textContent = tag;

      tagButton.addEventListener("click", () => {
        const index =
          selectedTags.indexOf(tag);

        if (index !== -1) {
          selectedTags.splice(index, 1);

        } else {
          if (selectedTags.length >= 3) {
            return;
          }

          selectedTags.push(tag);
        }

        updateSelectedTagsDisplay();
        updateTagButtonStates();
        updateNavigationLinks();
      });

      tagList.appendChild(tagButton);
    });

    updateTagButtonStates();

  } catch (error) {
    console.error(
      "タグ一覧の取得に失敗しました:",
      error
    );

    tagList.textContent =
      "タグ一覧を取得できませんでした。";
  }
}


// =========================
// 「このタグで作品を探す」
// =========================

applyTagsButton.addEventListener("click", () => {
  const params = createConditionParams();

  window.location.href =
    params.toString()
      ? `index.html?${params.toString()}`
      : "index.html";
});


// =========================
// 選択解除
// =========================

clearTagsButton.addEventListener("click", () => {
  selectedTags.length = 0;

  updateSelectedTagsDisplay();
  updateTagButtonStates();
  updateNavigationLinks();
});


// =========================
// 初期表示
// =========================

updateTypeDisplay();
updateSelectedTagsDisplay();
updateNavigationLinks();
displayTags();