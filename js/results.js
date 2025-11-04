// Get students data from localStorage
function getStudents() {
  return JSON.parse(localStorage.getItem("students") || "[]");
}

// Calculate average marks for a semester (input: {subject: mark, ...})
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

// Render the results overview
function renderResults() {
  const container = document.getElementById("results-container");
  const students = getStudents();

  if (students.length === 0) {
    container.innerHTML = "<p>No student records found.</p>";
    return;
  }

  // 1. Collect all semesters available in data
  const semestersSet = new Set();
  students.forEach((student) => {
    Object.keys(student.semesters).forEach((sem) =>
      semestersSet.add(parseInt(sem))
    );
  });
  const semesters = Array.from(semestersSet).sort((a, b) => a - b);

  // 2. Calculate class average per semester (mean of all students' semester averages)
  const classAvgPerSemester = {};
  semesters.forEach((sem) => {
    let sum = 0,
      count = 0;
    students.forEach((student) => {
      if (student.semesters[sem]) {
        const avg = calculateSemesterAverage(student.semesters[sem]);
        sum += avg;
        count++;
      }
    });
    classAvgPerSemester[sem] = count ? sum / count : 0;
  });

  // Build HTML output
  let html = `
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Class</th>
          ${semesters
            .map((sem) => `<th>Sem ${sem} Avg</th><th>Improvement %</th>`)
            .join("")}
        </tr>
      </thead>
      <tbody>
  `;

  students.forEach((student) => {
    let prevAvg = 0;
    html += `<tr><td>${student.name}</td><td>${student.className}</td>`;

    semesters.forEach((sem) => {
      if (student.semesters[sem]) {
        const avg = calculateSemesterAverage(student.semesters[sem]);
        const improvement = prevAvg ? calculateImprovement(avg, prevAvg) : 0;
        prevAvg = avg;
        html += `<td>${avg.toFixed(2)}%</td><td>${improvement.toFixed(
          2
        )}%</td>`;
      } else {
        // no data for this semester
        html += `<td>-</td><td>-</td>`;
      }
    });

    html += `</tr>`;
  });

  // Add class average row
  html += `<tr style="font-weight:bold; background:#f0f0f0;">
    <td colspan="2">Class Average</td>`;
  semesters.forEach((sem) => {
    const avg = classAvgPerSemester[sem];
    html += `<td>${avg.toFixed(2)}%</td><td>-</td>`;
  });
  html += `</tr>`;

  html += `</tbody></table>`;

  container.innerHTML = html;
}
