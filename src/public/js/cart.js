// Remove the <script> tags - they're not needed in .js files
const menuToggle = document.getElementById("menuToggle");
const navActions = document.getElementById("navActions");

menuToggle.addEventListener("click", () => navActions.classList.toggle("show"));
