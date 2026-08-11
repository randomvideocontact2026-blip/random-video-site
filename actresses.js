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

if (typeFromUrl === "2d" || typeFromUrl === "vr") {
  navTagsLink.href = `tags.html?type=${typeFromUrl}`;
  navActressesLink.href = `actresses.html?type=${typeFromUrl}`;
}

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

function showActressResults(keyword = "") {
  actressResults.innerHTML = "";

  const trimmedKeyword = keyword.trim();

  // 何も入力されていないときは候補を表示しない
  if (trimmedKeyword === "") {
    return;
  }

  const matchedActresses = allActresses.filter(actress =>
    actress.includes(trimmedKeyword)
  );

  if (matchedActresses.length === 0) {
    const message = document.createElement("p");
    message.textContent = "該当する女優が見つかりません。";
    actressResults.appendChild(message);
    return;
  }

  matchedActresses.forEach(actress => {
    const link = document.createElement("a");

    const params = new URLSearchParams();

    params.set("actress", actress);

    if (tagFromUrl) {
      params.set("tag", tagFromUrl);
    }

    if (typeFromUrl === "2d" || typeFromUrl === "vr") {
      params.set("type", typeFromUrl);
    }



    link.href = `index.html?${params.toString()}`;
    link.textContent = actress;

    actressResults.appendChild(link);
  });
}

actressSearchInput.addEventListener("input", () => {
  showActressResults(actressSearchInput.value);
});

updateTypeDisplay();