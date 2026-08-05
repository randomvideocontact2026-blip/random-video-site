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

const tags = [
  ...new Set(items.flatMap((item) => item.genres))
].sort((a, b) => a.localeCompare(b, "ja"));

tags.forEach((tag) => {
  const tagLink = document.createElement("a");

  const itemCount = items.filter((item) =>
    item.genres.includes(tag)
  ).length;

  tagLink.textContent = `${tag}（${itemCount}）`;
  tagLink.href = `index.html?tag=${encodeURIComponent(tag)}`;

  tagList.appendChild(tagLink);
});