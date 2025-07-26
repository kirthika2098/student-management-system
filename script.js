let students = [];
let editIndex = null;

const form = document.getElementById('studentForm');
const tableBody = document.querySelector('#studentTable tbody');
const searchInput = document.getElementById('searchInput');

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const student = {
    name: data.get('name'),
    age: data.get('age'),
    grade: data.get('grade'),
    degree: data.get('degree'),
    email: data.get('email')
  };

  if (editIndex !== null) {
    students[editIndex] = student;
    editIndex = null;
    form.querySelector('button').textContent = 'Add Student';
  } else students.push(student);

  form.reset();
  renderTable();
});

function renderTable(data = students) {
  tableBody.innerHTML = '';
  data.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.age}</td>
      <td>${s.grade}</td>
      <td>${s.degree}</td>
      <td>${s.email}</td>
      <td>
        <button class="btn btn-primary" onclick="editStudent(${i})">Edit</button>
        <button class="btn btn-primary" onclick="deleteStudent(${i})">Delete</button>
      </td>`;
    tableBody.appendChild(tr);
  });
}

window.editStudent = i => {
  const s = students[i];
  form.name.value = s.name;
  form.age.value = s.age;
  form.grade.value = s.grade;
  form.degree.value = s.degree;
  form.email.value = s.email;
  editIndex = i;
  form.querySelector('button').textContent = 'Update Student';
};

window.deleteStudent = i => {
  if (confirm('Delete this student?')) {
    students.splice(i, 1);
    renderTable();
  }
};

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  renderTable(students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.degree.toLowerCase().includes(q)
  ));
});
