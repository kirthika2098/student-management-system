function loadNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.innerHTML = `
    <a href="index.html">🏠 Home</a>
    <a href="add-student.html">➕ Add Student</a>
    <a href="edit-student.html">✏️ Edit Student</a>
    <a href="results.html">📊 Results</a>
    <a href="about.html">ℹ️ About</a>
    <a href="login.html" style="float:right;">🔑 Logout</a>
  `;
}

// Helper to fetch data from localStorage
function getStudents() {
  return JSON.parse(localStorage.getItem("students")) || [];
}

function saveStudents(data) {
  localStorage.setItem("students", JSON.stringify(data));
}
