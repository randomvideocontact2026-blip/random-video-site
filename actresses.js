const ageGate =
  document.getElementById("ageGate");

const mainContent =
  document.getElementById("mainContent");

const ageConfirmButton =
  document.getElementById("ageConfirmButton");

const actressSearchInput =
  document.getElementById("actressSearchInput");

const actressResults =
  document.getElementById("actressResults");

const selectedActressesContainer =
  document.getElementById("selectedActresses");

const selectedActressCount =
  document.getElementById("selectedActressCount");

const applyActressesButton =
  document.getElementById("applyActressesButton");

const clearActressesButton =
  document.getElementById("clearActressesButton");


// =========================
// 年齢確認
// =========================

const ageConfirmed =
  sessionStorage.getItem("ageConfirmed");

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
// URLから条件を取得
// =========================

const urlParams =
  new URLSearchParams(
    window.location.search
  );

const selectedTags =
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


// =========================
// ナビ取得
// =========================

const navTagsLink =
  document.getElementById("navTagsLink");

const navActressesLink =
  document.getElementById(
    "navActressesLink"
  );

const navAllLink =
  document.getElementById("navAllLink");

const nav2dLink =
  document.getElementById("nav2dLink");

const navVrLink =
  document.getElementById("navVrLink");

const typeIndicator =
  document.getElementById(
    "typeIndicator"
  );


// =========================
// 条件URL生成
// =========================

function createConditionParams(
  includeType = true
) {
  const params =
    new URLSearchParams();

  selectedTags.forEach((tag) => {
    params.append("tag", tag);
  });

  selectedActresses.forEach(
    (actress) => {
      params.append(
        "actress",
        actress
      );
    }
  );

  if (
    includeType &&
    (
      typeFromUrl === "2d" ||
      typeFromUrl === "vr"
    )
  ) {
    params.set(
      "type",
      typeFromUrl
    );
  }

  return params;
}


// =========================
// ナビURL更新
// =========================

function updateNavigationLinks() {
  const baseParams =
    createConditionParams(false);


  // 共通
  navAllLink.href =
    baseParams.toString()
      ? `actresses.html?${baseParams.toString()}`
      : "actresses.html";


  // 2D
  const params2d =
    new URLSearchParams(
      baseParams
    );

  params2d.set("type", "2d");

  nav2dLink.href =
    `actresses.html?${params2d.toString()}`;


  // VR
  const paramsVr =
    new URLSearchParams(
      baseParams
    );

  paramsVr.set("type", "vr");

  navVrLink.href =
    `actresses.html?${paramsVr.toString()}`;


  // 女優検索
  const actressParams =
    createConditionParams(true);

  navActressesLink.href =
    actressParams.toString()
      ? `actresses.html?${actressParams.toString()}`
      : "actresses.html";


  // タグ一覧
  const tagParams =
    createConditionParams(true);

  navTagsLink.href =
    tagParams.toString()
      ? `tags.html?${tagParams.toString()}`
      : "tags.html";
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

  if (typeFromUrl === "2d") {
    nav2dLink.classList.add(
      "active-type"
    );

    typeIndicator.textContent =
      "現在：2D版を表示中";

    typeIndicator.classList.add(
      "is-2d"
    );

  } else if (typeFromUrl === "vr") {
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
// 選択中女優表示
// =========================

function updateSelectedActressesDisplay() {
  selectedActressesContainer.innerHTML =
    "";

  selectedActressCount.textContent =
    selectedActresses.length;

  if (
    selectedActresses.length === 0
  ) {
    const emptyMessage =
      document.createElement("span");

    emptyMessage.className =
      "no-selected-actresses";

    emptyMessage.textContent =
      "まだ女優を選択していません。";

    selectedActressesContainer.appendChild(
      emptyMessage
    );

    applyActressesButton.disabled =
      true;

    return;
  }

  selectedActresses.forEach(
    (actress) => {
      const chip =
        document.createElement(
          "button"
        );

      chip.type = "button";

      chip.className =
        "selected-actress-chip";

      chip.textContent =
        `${actress} ×`;

      chip.addEventListener(
        "click",
        () => {
          selectedActresses =
            selectedActresses.filter(
              (name) =>
                name !== actress
            );

          updateSelectedActressesDisplay();
          updateActressButtonStates();
          updateNavigationLinks();
        }
      );

      selectedActressesContainer.appendChild(
        chip
      );
    }
  );

  applyActressesButton.disabled =
    false;
}


// =========================
// 検索結果の選択状態
// =========================

function updateActressButtonStates() {
  const buttons =
    actressResults.querySelectorAll(
      "[data-actress]"
    );

  buttons.forEach((button) => {
    const actress =
      button.dataset.actress;

    const isSelected =
      selectedActresses.includes(
        actress
      );

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
// 女優を選択・解除
// =========================

function toggleActress(actressName) {
  const index =
    selectedActresses.indexOf(
      actressName
    );

  if (index !== -1) {
    selectedActresses.splice(
      index,
      1
    );

  } else {
    if (
      selectedActresses.length >= 3
    ) {
      return;
    }

    selectedActresses.push(
      actressName
    );
  }

  updateSelectedActressesDisplay();
  updateActressButtonStates();
  updateNavigationLinks();
}


// =========================
// 女優検索
// =========================

async function showActressResults(
  keyword = ""
) {
  actressResults.innerHTML = "";

  const trimmedKeyword =
    keyword.trim();

  if (trimmedKeyword === "") {
    return;
  }

  try {
    const apiUrl =
      new URL(
        "https://issaku-ichie-api.randomvideo-contact2026.workers.dev/"
      );

    apiUrl.searchParams.set(
      "actresses",
      trimmedKeyword
    );

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
        `女優検索APIエラー: ${response.status}`
      );
    }

    const data =
      await response.json();

    const matchedActresses =
      data.actresses ?? [];

    if (
      matchedActresses.length === 0
    ) {
      const message =
        document.createElement(
          "p"
        );

      message.textContent =
        "該当する女優が見つかりません。";

      actressResults.appendChild(
        message
      );

      return;
    }

    matchedActresses.forEach(
      (actress) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        button.className =
          "actress-choice";

        button.dataset.actress =
          actress.name;

        button.textContent =
          actress.name;

        button.addEventListener(
          "click",
          () => {
            toggleActress(
              actress.name
            );
          }
        );

        actressResults.appendChild(
          button
        );
      }
    );

    updateActressButtonStates();

  } catch (error) {
    console.error(
      "女優検索に失敗しました:",
      error
    );

    const message =
      document.createElement("p");

    message.textContent =
      "女優検索に失敗しました。";

    actressResults.appendChild(
      message
    );
  }
}


// =========================
// 検索入力
// =========================

let searchTimer = null;

actressSearchInput.addEventListener(
  "input",
  () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(
      () => {
        showActressResults(
          actressSearchInput.value
        );
      },
      300
    );
  }
);


// =========================
// この女優で作品を探す
// =========================

applyActressesButton.addEventListener(
  "click",
  () => {
    const params =
      createConditionParams(true);

    window.location.href =
      params.toString()
        ? `index.html?${params.toString()}`
        : "index.html";
  }
);


// =========================
// 全解除
// =========================

clearActressesButton.addEventListener(
  "click",
  () => {
    selectedActresses = [];

    updateSelectedActressesDisplay();
    updateActressButtonStates();
    updateNavigationLinks();
  }
);


// =========================
// 初期表示
// =========================

updateTypeDisplay();
updateSelectedActressesDisplay();
updateNavigationLinks();