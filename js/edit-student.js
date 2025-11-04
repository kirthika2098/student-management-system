// Utility to get students
function getStudents() {
  return JSON.parse(localStorage.getItem("students") || "[]");
}

function saveStudents(students) {
  localStorage.setItem("students", JSON.stringify(students));
}

// Populate dropdown with student options
function populateStudentSelector() {
  const select = document.getElementById("studentSelect");
  const students = getStudents();

  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = `${student.name}||${student.className}`; // composite key
    option.textContent = `${student.name} (${student.className})`;
    select.appendChild(option);
  });
}

// Load selected student data into form for editing
function loadStudentData() {
  const select = document.getElementById("studentSelect");
  const selected = select.value;
  const formContainer = document.getElementById("editFormContainer");

  if (!selected) {
    formContainer.style.display = "none";
    return;
  }

  formContainer.style.display = "block";

  const [name, className] = selected.split("||");
  const students = getStudents();
  const student = students.find(
    (s) => s.name === name && s.className === className
  );

  if (!student) return alert("Student not found!");

  // Fill static fields
  document.getElementById("editName").value = student.name;
  document.getElementById("editClassName").value = student.className;

  // Clear semesters container
  const semestersContainer = document.getElementById("semestersContainer");
  semestersContainer.innerHTML = "";

  // Render semesters & their subjects
  const semestersEntries = Object.entries(student.semesters).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0])
  );

  semestersEntries.forEach(([sem, subjects]) => {
    addSemesterBlock(parseInt(sem), subjects);
  });
}

// Add a semester block with subject inputs
function addSemesterBlock(semesterNumber, subjects = {}) {
  const container = document.getElementById("semestersContainer");

  const semesterDiv = document.createElement("div");
  semesterDiv.className = "semester-block";
  semesterDiv.style.border = "1px solid #ccc";
  semesterDiv.style.padding = "10px";
  semesterDiv.style.marginBottom = "10px";

  // Semester header with remove button
  semesterDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h4>Semester <input type="number" class="edit-semester-number" value="${semesterNumber}" min="1" style="width:60px;" /></h4>
      <button type="button" onclick="removeSemester(this)">Remove Semester ❌</button>
    </div>
    <div class="subjects-container"></div>
    <button type="button" onclick="addSubjectRow(this)">➕ Add Subject</button>
  `;

  container.appendChild(semesterDiv);

  // Add existing subjects
  const subjectsContainer = semesterDiv.querySelector(".subjects-container");
  Object.entries(subjects).forEach(([sub, mark]) => {
    addSubjectRow(null, subjectsContainer, sub, mark);
  });

  // If no subjects, add one blank row by default
  if (Object.keys(subjects).length === 0) {
    addSubjectRow(null, subjectsContainer);
  }
}

// Remove semester block
function removeSemester(button) {
  if (confirm("Are you sure you want to remove this semester?")) {
    button.closest(".semester-block").remove();
  }
}

// Add subject input row inside a semester block
// if caller passes `button`, it means add inside the semester block containing the button
// else parameters allow adding to specified container directly (for initial loading)
function addSubjectRow(button, containerOverride, subjectName = "", mark = "") {
  const container =
    containerOverride ||
    button.closest(".semester-block").querySelector(".subjects-container");

  const rowDiv = document.createElement("div");
  rowDiv.className = "subject-row";
  rowDiv.style.marginBottom = "5px";

  rowDiv.innerHTML = `
    <input class="edit-subject-name" placeholder="Subject" value="${subjectName}" />
    <input class="edit-subject-mark" type="number" min="0" max="100" placeholder="Marks" value="${mark}" 
    style="width:60px; margin-left:5px;" />
    <button type="button" onclick="removeSubjectRow(this)">❌</button>
  `;

  container.appendChild(rowDiv);
}

// Remove a subject row
function removeSubjectRow(button) {
  button.parentElement.remove();
}

// Add a new empty semester block with empty fields
function addSemester() {
  // Find next semester number (max existing + 1)
  const container = document.getElementById("semestersContainer");
  const existingSemesters = Array.from(
    container.querySelectorAll(".edit-semester-number")
  )
    .map((input) => parseInt(input.value))
    .filter((n) => !isNaN(n));

  const nextSem = existingSemesters.length
    ? Math.max(...existingSemesters) + 1
    : 1;
  addSemesterBlock(nextSem, {});
}

// Validate and save edited student data
function saveEditedStudent() {
  const name = document.getElementById("editName").value.trim();
  const className = document.getElementById("editClassName").value.trim();

  if (!name || !className) {
    alert("Student Name and Class are required.");
    return;
  }

  const container = document.getElementById("semestersContainer");
  const semesterBlocks = container.querySelectorAll(".semester-block");

  if (semesterBlocks.length === 0) {
    alert("Add at least one semester.");
    return;
  }

  const semesters = {};

  for (const block of semesterBlocks) {
    const semInput = block.querySelector(".edit-semester-number");
    const semNum = parseInt(semInput.value);
    if (isNaN(semNum) || semNum < 1) {
      alert("Please enter a valid semester number (>=1).");
      return;
    }

    const subjectNames = block.querySelectorAll(".edit-subject-name");
    const subjectMarks = block.querySelectorAll(".edit-subject-mark");

    const subjects = {};
    for (let i = 0; i < subjectNames.length; i++) {
      const sub = subjectNames[i].value.trim();
      const mark = parseFloat(subjectMarks[i].value);
      if (!sub) {
        alert("Subject name cannot be empty.");
        return;
      }
      if (isNaN(mark) || mark < 0 || mark > 100) {
        alert(
          `Invalid mark for subject "${sub}" in semester ${semNum}. Marks must be between 0 and 100.`
        );
        return;
      }
      subjects[sub] = mark;
    }

    if (Object.keys(subjects).length === 0) {
      alert(`Semester ${semNum} must have at least one subject.`);
      return;
    }

    // Check duplicate semesters
    if (semesters[semNum]) {
      alert(`Duplicate semester number ${semNum}.`);
      return;
    }

    semesters[semNum] = subjects;
  }

  // Update student in localStorage
  let students = getStudents();
  const idx = students.findIndex(
    (s) => s.name === name && s.className === className
  );
  if (idx === -1) {
    alert("Student not found!");
    return;
  }

  students[idx].semesters = semesters;
  saveStudents(students);

  alert("✅ Student data updated successfully!");

  // Reset form and selection
  document.getElementById("studentSelect").value = "";
  document.getElementById("editFormContainer").style.display = "none";
}
