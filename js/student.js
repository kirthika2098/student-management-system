// Add new subject input row
function addSubjectRow() {
  const container = document.getElementById("subjects-container");
  const div = document.createElement("div");
  div.classList.add("subject-row");
  div.innerHTML = `
    <input class="subject-name" placeholder="Subject" />
    <input class="subject-mark" type="number" min="0" max="100" placeholder="Marks" />
    <button type="button" onclick="removeSubjectRow(this)">❌</button>
  `;
  container.appendChild(div);
}

// Remove a subject row
function removeSubjectRow(button) {
  button.parentElement.remove();
}

// Get students from localStorage
function getStudents() {
  return JSON.parse(localStorage.getItem("students") || "[]");
}

// Save students to localStorage
function saveStudents(students) {
  localStorage.setItem("students", JSON.stringify(students));
}

// Add or update student
function addStudent() {
  const name = document.getElementById("name").value.trim();
  const className = document.getElementById("className").value.trim();
  const semester = parseInt(document.getElementById("semester").value);

  if (!name || !className || !semester) {
    alert("⚠️ Please fill Student Name, Class, and Semester.");
    return;
  }

  // Read all subject-mark pairs
  const subjectNames = [...document.getElementsByClassName("subject-name")];
  const subjectMarks = [...document.getElementsByClassName("subject-mark")];

  const subjects = {};
  for (let i = 0; i < subjectNames.length; i++) {
    const sub = subjectNames[i].value.trim();
    const mark = parseFloat(subjectMarks[i].value);
    if (!sub || isNaN(mark) || mark < 0 || mark > 100) {
      alert(
        `⚠️ Please enter valid subject and marks (0-100) for subject row ${
          i + 1
        }`
      );
      return;
    }
    subjects[sub] = mark;
  }

  if (Object.keys(subjects).length === 0) {
    alert("⚠️ Please add at least one subject and marks.");
    return;
  }

  let students = getStudents();
  let student = students.find(
    (s) => s.name === name && s.className === className
  );

  if (!student) {
    student = { name, className, semesters: {} };
    students.push(student);
  }

  // Update semester data
  student.semesters[semester] = subjects;
  saveStudents(students);

  alert("✅ Student record added/updated successfully!");

  // Refresh table
  renderStudentsTable();

  // Clear form
  document.getElementById("name").value = "";
  document.getElementById("className").value = "";
  document.getElementById("semester").value = "";
  // Clear subject inputs, leave one empty row
  const container = document.getElementById("subjects-container");
  container.innerHTML = "";
  addSubjectRow();
}

// Delete student
function deleteStudent(name, className) {
  if (!confirm(`Are you sure you want to delete ${name} (${className})?`))
    return;
  let students = getStudents();
  students = students.filter(
    (s) => !(s.name === name && s.className === className)
  );
  saveStudents(students);
  renderStudentsTable();
}

// Calculate average marks for a semester
function calculateSemesterAverage(subjectMarks) {
  const marks = Object.values(subjectMarks);
  if (marks.length === 0) return 0;
  const sum = marks.reduce((a, b) => a + b, 0);
  return sum / marks.length;
}

// Calculate improvement % between semesters
function calculateImprovement(currentAvg, previousAvg) {
  if (previousAvg === 0) return 0;
  return ((currentAvg - previousAvg) / previousAvg) * 100;
}

// Render all students and their semesters with averages and improvement
function renderStudentsTable() {
  const table = document.getElementById("studentTable");
  if (!table) return;

  const students = getStudents();

  if (students.length === 0) {
    table.innerHTML = `<tr><td colspan="4">No records found.</td></tr>`;
    return;
  }

  table.innerHTML = students
    .map((student) => {
      const semesterEntries = Object.entries(student.semesters).sort(
        (a, b) => parseInt(a[0]) - parseInt(b[0])
      );

      // Build semesters HTML with marks, averages and improvement
      let semestersHtml = "";
      let prevAvg = 0;

      semesterEntries.forEach(([sem, subjects]) => {
        const avg = calculateSemesterAverage(subjects);
        const improvement = prevAvg ? calculateImprovement(avg, prevAvg) : 0;
        prevAvg = avg;

        const subjectsList = Object.entries(subjects)
          .map(([sub, mark]) => `${sub}: ${mark}`)
          .join(", ");

        semestersHtml += `
        <div>
          <strong>Sem ${sem}:</strong> ${subjectsList} <br />
          <em>Average:</em> ${avg.toFixed(2)}%
          <br />
          <em>Improvement:</em> ${improvement.toFixed(2)}%
        </div><br />
      `;
      });

      return `
      <tr>
        <td>${student.name}</td>
        <td>${student.className}</td>
        <td>${semestersHtml}</td>
        <td><button onclick="deleteStudent('${student.name}','${student.className}')">🗑️ Delete</button></td>
      </tr>
    `;
    })
    .join("");
}

// Initialize first subject input row on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addSubjectRow);
} else {
  addSubjectRow();
}
