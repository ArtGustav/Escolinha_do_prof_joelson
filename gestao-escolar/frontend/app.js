const viewLabels = {
  dashboard: "Visão geral",
  alunos: "Alunos",
  cursos: "Cursos",
  turmas: "Matrículas",
  cadastros: "Cadastros"
};

const state = {
  activeView: "dashboard",
  alunos: [],
  cursos: [],
  turmas: []
};

const columns = {
  alunos: ["ID", "ALUNO", "E-MAIL"],
  cursos: ["ID", "CURSO", "VAGAS DISPONÍVEIS"],
  turmas: ["ID", "ALUNO", "CURSO", "DATA DA MATRÍCULA"]
};

const elements = {
  title: document.querySelector("#page-title"),
  subtitle: document.querySelector("#page-subtitle"),
  breadcrumb: document.querySelector("#breadcrumb-current"),
  tableTitle: document.querySelector("#table-title"),
  tableDescription: document.querySelector("#table-description"),
  tableHead: document.querySelector("#table-head"),
  tableBody: document.querySelector("#table-body"),
  tableCount: document.querySelector("#table-count"),
  search: document.querySelector("#search-input"),
  empty: document.querySelector("#empty-state"),
  connection: document.querySelector("#connection-label"),
  connectionDot: document.querySelector("#connection-dot"),
  error: document.querySelector("#error-banner"),
  loading: document.querySelector("#loading-banner"),
  refresh: document.querySelector("#refresh-button"),
  stats: document.querySelector("#stats-grid"),
  liveIndicator: document.querySelector(".live-indicator"),
  dataCard: document.querySelector(".data-card"),
  registrations: document.querySelector("#registration-view"),
  enrollmentForm: document.querySelector("#enrollment-form"),
  enrollmentDialog: document.querySelector("#enrollment-dialog"),
  enrollmentEditForm: document.querySelector("#enrollment-edit-form"),
  editEnrollmentFeedback: document.querySelector("#edit-enrollment-feedback"),
  studentDialog: document.querySelector("#student-dialog"),
  studentEditForm: document.querySelector("#student-edit-form"),
  editStudentFeedback: document.querySelector("#edit-student-feedback"),
  courseDialog: document.querySelector("#course-dialog"),
  courseEditForm: document.querySelector("#course-edit-form"),
  editCourseFeedback: document.querySelector("#edit-course-feedback")
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function initials(name) {
  return String(name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("pt-BR") || "?";
}

function setConnectionStatus(connected) {
  elements.connection.textContent = connected ? "Conectado" : "Sem conexão";
  elements.connectionDot.classList.toggle("is-connected", connected);
  elements.connectionDot.classList.toggle("is-error", !connected);
}

async function loadData() {
  elements.loading.hidden = false;
  elements.error.hidden = true;
  elements.refresh.classList.add("is-loading");

  try {
    const results = await Promise.all(
      ["alunos", "cursos", "turmas"].map(async (resource) => {
        const response = await fetch(`/api/${resource}`);
        if (!response.ok) {
          throw new Error(`A API /${resource} respondeu com HTTP ${response.status}.`);
        }

        const records = await response.json();
        if (!Array.isArray(records)) {
          throw new Error(`A API /${resource} retornou dados em formato inesperado.`);
        }
        return [resource, records];
      })
    );

    for (const [resource, records] of results) {
      state[resource] = records;
    }
    updateEnrollmentOptions();
    setConnectionStatus(true);
    render();
  } catch (error) {
    setConnectionStatus(false);
    elements.error.textContent = `${error.message} Verifique se o backend está ativo em http://localhost:3000 e atualize a página.`;
    elements.error.hidden = false;
  } finally {
    elements.loading.hidden = true;
    elements.refresh.classList.remove("is-loading");
  }
}

function currentRecords() {
  if (state.activeView === "alunos") return state.alunos;
  if (state.activeView === "cursos") return state.cursos;
  if (state.activeView === "turmas") return state.turmas;
  return [...state.alunos].slice(-5).reverse();
}

function renderRows(records) {
  if (state.activeView === "cursos") {
    return records.map((course) => `
      <tr>
        <td class="id-cell">#${escapeHtml(course.id)}</td>
        <td><div class="person-cell"><span class="person-avatar courses-icon">▤</span><span class="person-copy"><strong>${escapeHtml(course.nome)}</strong><small>Curso cadastrado</small></span></div></td>
        <td><span class="capacity">${escapeHtml(course.vagas ?? 0)} vagas</span></td>
        <td>
          <div class="row-actions">
            <button class="row-action-button" type="button" data-action="edit" data-resource="cursos" data-id="${escapeHtml(course.id)}" aria-label="Editar curso ${escapeHtml(course.nome)}">Editar</button>
            <button class="row-action-button is-danger" type="button" data-action="delete" data-resource="cursos" data-id="${escapeHtml(course.id)}" aria-label="Excluir curso ${escapeHtml(course.nome)}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  if (state.activeView === "turmas") {
    return records.map((enrollment) => `
      <tr>
        <td class="id-cell">#${escapeHtml(enrollment.id)}</td>
        <td><div class="person-cell"><span class="person-avatar">${escapeHtml(initials(enrollment.aluno_nome))}</span><span class="person-copy"><strong>${escapeHtml(enrollment.aluno_nome)}</strong><small>Aluno matriculado</small></span></div></td>
        <td><span class="course-pill">${escapeHtml(enrollment.curso_nome)}</span></td>
        <td>${escapeHtml(formatDate(enrollment.data_matricula))}</td>
        <td>
          <div class="row-actions">
            <button class="row-action-button" type="button" data-action="edit" data-resource="turmas" data-id="${escapeHtml(enrollment.id)}" aria-label="Editar matrícula ${escapeHtml(enrollment.id)}">Editar</button>
            <button class="row-action-button is-danger" type="button" data-action="delete" data-resource="turmas" data-id="${escapeHtml(enrollment.id)}" aria-label="Excluir matrícula ${escapeHtml(enrollment.id)}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  return records.map((student) => `
    <tr>
      <td class="id-cell">#${escapeHtml(student.id)}</td>
      <td><div class="person-cell"><span class="person-avatar">${escapeHtml(initials(student.nome))}</span><span class="person-copy"><strong>${escapeHtml(student.nome)}</strong><small>Aluno</small></span></div></td>
      <td>${escapeHtml(student.email)}</td>
      ${state.activeView === "alunos" ? `
        <td>
          <div class="row-actions">
            <button class="row-action-button" type="button" data-action="edit" data-resource="alunos" data-id="${escapeHtml(student.id)}" aria-label="Editar aluno ${escapeHtml(student.nome)}">Editar</button>
            <button class="row-action-button is-danger" type="button" data-action="delete" data-resource="alunos" data-id="${escapeHtml(student.id)}" aria-label="Excluir aluno ${escapeHtml(student.nome)}">Excluir</button>
          </div>
        </td>
      ` : ""}
    </tr>
  `).join("");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function searchableValue(record) {
  return Object.values(record).join(" ").toLocaleLowerCase("pt-BR");
}

function renderTable() {
  if (state.activeView === "cadastros") return;
  const isDashboard = state.activeView === "dashboard";
  const resource = isDashboard ? "alunos" : state.activeView;
  const term = elements.search.value.trim().toLocaleLowerCase("pt-BR");
  const records = currentRecords().filter((record) => searchableValue(record).includes(term));
  const headers = isDashboard
    ? columns.alunos
    : [...columns[resource], "AÇÕES"];

  elements.tableHead.innerHTML = `<tr>${headers.map((header) => `<th scope="col">${header}</th>`).join("")}</tr>`;
  elements.tableBody.innerHTML = renderRows(records);
  elements.empty.hidden = records.length > 0;
  elements.tableBody.hidden = records.length === 0;
  elements.tableCount.textContent = `${records.length} ${records.length === 1 ? "registro" : "registros"}`;
}

function render() {
  const label = viewLabels[state.activeView];
  const isDashboard = state.activeView === "dashboard";
  const isRegistrationView = state.activeView === "cadastros";

  elements.title.textContent = label;
  elements.breadcrumb.textContent = label;
  elements.subtitle.textContent = isDashboard
    ? "Acompanhe os dados da sua escola em um só lugar."
    : isRegistrationView
      ? "Adicione alunos, cursos e matrículas à sua escola."
      : `Consulte os registros de ${label.toLocaleLowerCase("pt-BR")} cadastrados no banco.`;
  elements.stats.hidden = !isDashboard;
  elements.dataCard.hidden = isRegistrationView;
  elements.registrations.hidden = !isRegistrationView;
  elements.liveIndicator.hidden = isRegistrationView;

  document.querySelector("#stat-alunos").textContent = state.alunos.length;
  document.querySelector("#stat-cursos").textContent = state.cursos.length;
  document.querySelector("#stat-turmas").textContent = state.turmas.length;
  document.querySelector("#stat-vagas").textContent = state.cursos.reduce(
    (total, course) => total + (Number(course.vagas) || 0),
    0
  );
  document.querySelector("#nav-alunos-count").textContent = state.alunos.length;
  document.querySelector("#nav-cursos-count").textContent = state.cursos.length;
  document.querySelector("#nav-turmas-count").textContent = state.turmas.length;

  for (const button of document.querySelectorAll(".nav-item")) {
    const active = button.dataset.view === state.activeView;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }
  if (isRegistrationView) return;

  elements.tableTitle.textContent = isDashboard
    ? "Alunos recentes"
    : state.activeView === "turmas" ? "Matrículas registradas" : `${label} cadastrados`;
  elements.tableDescription.textContent = isDashboard
    ? "Alunos cadastrados no banco de dados"
    : `${state[state.activeView].length} registros encontrados`;
  elements.search.placeholder = `Buscar ${isDashboard ? "aluno" : label.toLocaleLowerCase("pt-BR")}...`;
  renderTable();
}

function updateEnrollmentOptions() {
  const studentSelect = elements.enrollmentForm.elements.aluno_id;
  const courseSelect = elements.enrollmentForm.elements.curso_id;
  const selectedStudent = studentSelect.value;
  const selectedCourse = courseSelect.value;

  studentSelect.innerHTML = `<option value="">${state.alunos.length ? "Selecione um aluno" : "Cadastre um aluno primeiro"}</option>` +
    state.alunos.map((student) =>
      `<option value="${escapeHtml(student.id)}">${escapeHtml(student.nome)} — ${escapeHtml(student.email)}</option>`
    ).join("");
  const availableCourses = state.cursos.filter((course) => Number(course.vagas) > 0);
  courseSelect.innerHTML = `<option value="">${availableCourses.length ? "Selecione um curso" : "Nenhum curso com vagas disponíveis"}</option>` +
    state.cursos
      .filter((course) => Number(course.vagas) > 0)
      .map((course) =>
        `<option value="${escapeHtml(course.id)}">${escapeHtml(course.nome)} — ${escapeHtml(course.vagas)} vagas</option>`
      ).join("");

  studentSelect.value = selectedStudent;
  courseSelect.value = selectedCourse;
  studentSelect.disabled = state.alunos.length === 0;
  courseSelect.disabled = availableCourses.length === 0;
}

function updateEditEnrollmentOptions(selectedStudentId, selectedCourseId) {
  const studentSelect = elements.enrollmentEditForm.elements.aluno_id;
  const courseSelect = elements.enrollmentEditForm.elements.curso_id;
  const availableCourses = state.cursos.filter((course) =>
    Number(course.vagas) > 0 || String(course.id) === String(selectedCourseId)
  );

  studentSelect.innerHTML = `<option value="">${state.alunos.length ? "Selecione um aluno" : "Nenhum aluno cadastrado"}</option>` +
    state.alunos.map((student) =>
      `<option value="${escapeHtml(student.id)}">${escapeHtml(student.nome)} — ${escapeHtml(student.email)}</option>`
    ).join("");
  courseSelect.innerHTML = `<option value="">${availableCourses.length ? "Selecione um curso" : "Nenhum curso disponível"}</option>` +
    availableCourses.map((course) =>
      `<option value="${escapeHtml(course.id)}">${escapeHtml(course.nome)} — ${escapeHtml(course.vagas)} vagas${String(course.id) === String(selectedCourseId) ? " (atual)" : ""}</option>`
    ).join("");

  studentSelect.value = String(selectedStudentId);
  courseSelect.value = String(selectedCourseId);
  studentSelect.disabled = state.alunos.length === 0;
  courseSelect.disabled = availableCourses.length === 0;
}

async function readApiResponse(response) {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.mensagem || result.message || `A solicitação falhou (HTTP ${response.status}).`);
  }
  return result;
}

function setEditFeedback(message, type = "") {
  elements.editEnrollmentFeedback.textContent = message;
  elements.editEnrollmentFeedback.classList.remove("is-error", "is-success");
  if (type) elements.editEnrollmentFeedback.classList.add(`is-${type}`);
}

function setFeedback(element, message, type = "") {
  element.textContent = message;
  element.classList.remove("is-error", "is-success");
  if (type) element.classList.add(`is-${type}`);
}

async function openEnrollmentEditor(id) {
  setEditFeedback("");
  const submitButton = elements.enrollmentEditForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const enrollment = await readApiResponse(await fetch(`/api/turmas/${encodeURIComponent(id)}`));
    updateEditEnrollmentOptions(enrollment.aluno_id, enrollment.curso_id);
    elements.enrollmentDialog.showModal();
  } catch (error) {
    elements.error.textContent = error.message || "Não foi possível carregar a matrícula.";
    elements.error.hidden = false;
  } finally {
    submitButton.disabled = false;
  }
}

async function openStudentEditor(id) {
  setFeedback(elements.editStudentFeedback, "");
  try {
    const student = await readApiResponse(await fetch(`/api/alunos/${encodeURIComponent(id)}`));
    elements.studentEditForm.elements.nome.value = student.nome;
    elements.studentEditForm.elements.email.value = student.email;
    elements.studentEditForm.dataset.recordId = id;
    elements.studentDialog.showModal();
  } catch (error) {
    elements.error.textContent = error.message || "Não foi possível carregar o aluno.";
    elements.error.hidden = false;
  }
}

async function openCourseEditor(id) {
  setFeedback(elements.editCourseFeedback, "");
  try {
    const course = await readApiResponse(await fetch(`/api/cursos/${encodeURIComponent(id)}`));
    elements.courseEditForm.elements.nome.value = course.nome;
    elements.courseEditForm.elements.vagas.value = course.vagas;
    elements.courseEditForm.dataset.recordId = id;
    elements.courseDialog.showModal();
  } catch (error) {
    elements.error.textContent = error.message || "Não foi possível carregar o curso.";
    elements.error.hidden = false;
  }
}

async function deleteRecord(resource, id) {
  const record = state[resource].find((item) => String(item.id) === String(id));
  const description = resource === "alunos"
    ? `Excluir o aluno ${record?.nome || ""}? Alunos com matrículas não podem ser excluídos.`
    : resource === "cursos"
      ? `Excluir o curso ${record?.nome || ""}? Cursos com matrículas não podem ser excluídos.`
      : `Excluir a matrícula de ${record?.aluno_nome || ""} no curso ${record?.curso_nome || ""}? A vaga será devolvida ao curso.`;
  if (!window.confirm(description)) return;

  try {
    await readApiResponse(await fetch(`/api/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" }));
    await loadData();
  } catch (error) {
    elements.error.textContent = error.message || "Não foi possível excluir a matrícula.";
    elements.error.hidden = false;
  }
}

async function submitRecordEdit(event, resource, form, dialog, feedback, getPayload) {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setFeedback(feedback, "");
  submitButton.disabled = true;
  submitButton.classList.add("is-submitting");

  try {
    const response = await fetch(`/api/${resource}/${encodeURIComponent(form.dataset.recordId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload(form))
    });
    await readApiResponse(response);
    dialog.close();
    await loadData();
  } catch (error) {
    setFeedback(feedback, error.message || "Não foi possível salvar as alterações.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-submitting");
  }
}

async function submitEnrollmentEdit(event) {
  event.preventDefault();
  const submitButton = elements.enrollmentEditForm.querySelector('button[type="submit"]');
  const enrollmentId = elements.enrollmentEditForm.dataset.enrollmentId;
  setEditFeedback("");
  submitButton.disabled = true;
  submitButton.classList.add("is-submitting");

  try {
    const response = await fetch(`/api/turmas/${encodeURIComponent(enrollmentId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aluno_id: Number(elements.enrollmentEditForm.elements.aluno_id.value),
        curso_id: Number(elements.enrollmentEditForm.elements.curso_id.value)
      })
    });
    await readApiResponse(response);
    elements.enrollmentDialog.close();
    await loadData();
  } catch (error) {
    setEditFeedback(error.message || "Não foi possível atualizar a matrícula.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-submitting");
  }
}

async function submitRegistration(event, resource, feedbackId, getPayload) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const feedback = document.querySelector(`#${feedbackId}`);
  feedback.textContent = "";
  feedback.classList.remove("is-error", "is-success");
  submitButton.disabled = true;
  submitButton.classList.add("is-submitting");

  try {
    const response = await fetch(`/api/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload(new FormData(form)))
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.mensagem || result.message || `Falha ao cadastrar (${response.status}).`);
    }

    feedback.textContent = result.mensagem || "Cadastro realizado com sucesso.";
    feedback.classList.add("is-success");
    form.reset();
    if (resource === "turmas") updateEnrollmentOptions();
    await loadData();
  } catch (error) {
    feedback.textContent = error.message || "Não foi possível concluir o cadastro.";
    feedback.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-submitting");
  }
}

for (const button of document.querySelectorAll(".nav-item")) {
  button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    elements.search.value = "";
    render();
  });
}

elements.search.addEventListener("input", renderTable);
elements.refresh.addEventListener("click", loadData);
elements.tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action][data-resource][data-id]");
  if (!button) return;

  if (button.dataset.action === "edit" && button.dataset.resource === "turmas") {
    elements.enrollmentEditForm.dataset.enrollmentId = button.dataset.id;
    openEnrollmentEditor(button.dataset.id);
  } else if (button.dataset.action === "edit" && button.dataset.resource === "alunos") {
    openStudentEditor(button.dataset.id);
  } else if (button.dataset.action === "edit" && button.dataset.resource === "cursos") {
    openCourseEditor(button.dataset.id);
  } else if (button.dataset.action === "delete") {
    deleteRecord(button.dataset.resource, button.dataset.id);
  }
});
elements.enrollmentEditForm.addEventListener("submit", submitEnrollmentEdit);
document.querySelector("#cancel-edit-button").addEventListener("click", () => elements.enrollmentDialog.close());
elements.studentEditForm.addEventListener("submit", (event) =>
  submitRecordEdit(
    event,
    "alunos",
    elements.studentEditForm,
    elements.studentDialog,
    elements.editStudentFeedback,
    (form) => ({
      nome: form.elements.nome.value.trim(),
      email: form.elements.email.value.trim()
    })
  )
);
elements.courseEditForm.addEventListener("submit", (event) =>
  submitRecordEdit(
    event,
    "cursos",
    elements.courseEditForm,
    elements.courseDialog,
    elements.editCourseFeedback,
    (form) => ({
      nome: form.elements.nome.value.trim(),
      vagas: Number(form.elements.vagas.value)
    })
  )
);
for (const dialog of document.querySelectorAll(".record-dialog, #enrollment-dialog")) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
for (const button of document.querySelectorAll("[data-close-dialog]")) {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close());
}
document.querySelector("#student-form").addEventListener("submit", (event) =>
  submitRegistration(event, "alunos", "student-feedback", (formData) => ({
    nome: formData.get("nome").trim(),
    email: formData.get("email").trim()
  }))
);
document.querySelector("#course-form").addEventListener("submit", (event) =>
  submitRegistration(event, "cursos", "course-feedback", (formData) => ({
    nome: formData.get("nome").trim(),
    vagas: Number(formData.get("vagas"))
  }))
);
elements.enrollmentForm.addEventListener("submit", (event) =>
  submitRegistration(event, "turmas", "enrollment-feedback", (formData) => ({
    aluno_id: Number(formData.get("aluno_id")),
    curso_id: Number(formData.get("curso_id"))
  }))
);
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(new Date());

render();
loadData();
