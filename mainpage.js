/* Interactive Resume Builder - JS */
(() => {
  const form = document.getElementById('resumeForm');
  const inputs = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    summary: document.getElementById('summary')
  };

  const skills = {
    checkboxes: Array.from(document.querySelectorAll('.skill-checkbox')),
    customInput: document.getElementById('customSkillInput'),
    chipsContainer: document.getElementById('selectedSkills'),
    selected: new Set()
  };

  const dynamic = {
    educationList: document.getElementById('educationList'),
    experienceList: document.getElementById('experienceList'),
    addEducationBtn: document.getElementById('addEducationBtn'),
    addExperienceBtn: document.getElementById('addExperienceBtn')
  };

  const buttons = {
    clear: document.getElementById('clearBtn'),
    print: document.getElementById('printBtn')
  };

  const preview = {
    name: document.getElementById('previewName'),
    contact: document.getElementById('previewContact'),
    summary: document.getElementById('previewSummary'),
    skills: document.getElementById('previewSkills'),
    edu: document.getElementById('previewEducation'),
    exp: document.getElementById('previewExperience'),
    sectionSummary: document.getElementById('sectionSummary'),
    sectionSkills: document.getElementById('sectionSkills'),
    sectionEducation: document.getElementById('sectionEducation'),
    sectionExperience: document.getElementById('sectionExperience')
  };

  const progress = {
    bar: document.getElementById('progressBar'),
    label: document.getElementById('progressLabel')
  };

  function updateProgressBar() {
    const fields = [inputs.name, inputs.email, inputs.phone, inputs.summary];
    let total = fields.length;
    let complete = fields.filter(el => (el.value || '').trim().length > 0).length;

    // Count skills
    total += 1; // skills group
    if (skills.selected.size > 0) complete += 1;

    // Count dynamic groups (education and experience): at least one row each to mark complete
    total += 2;
    if (dynamic.educationList.children.length > 0) complete += 1;
    if (dynamic.experienceList.children.length > 0) complete += 1;

    const pct = Math.round((complete / total) * 100);
    progress.bar.style.width = `${pct}%`;
    progress.label.textContent = `${pct}% complete`;
  }

  function createChip(label) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = label;
    const remove = document.createElement('button');
    remove.className = 'remove';
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${label}`);
    remove.textContent = '✕';
    remove.addEventListener('click', () => {
      skills.selected.delete(label);
      renderSelectedSkills();
      syncSkillCheckboxes();
      updatePreview();
    });
    chip.appendChild(remove);
    return chip;
  }

  function renderSelectedSkills() {
    skills.chipsContainer.innerHTML = '';
    Array.from(skills.selected).sort().forEach(s => {
      skills.chipsContainer.appendChild(createChip(s));
    });
  }

  function syncSkillCheckboxes() {
    skills.checkboxes.forEach(cb => {
      cb.checked = skills.selected.has(cb.value);
    });
  }

  function handleCustomSkillInput(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (skills.customInput.value || '').trim();
      if (value.length === 0) return;
      skills.selected.add(value);
      skills.customInput.value = '';
      renderSelectedSkills();
      updatePreview();
      updateProgressBar();
    }
  }

  function createEducationRow(preset = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dynamic-item';

    const row1 = document.createElement('div');
    row1.className = 'dynamic-item__row two';
    const school = inputWithLabel('School / Institution', 'text', preset.school);
    const degree = inputWithLabel('Degree / Program', 'text', preset.degree);
    row1.append(school.label, degree.label);

    const row2 = document.createElement('div');
    row2.className = 'dynamic-item__row two';
    const start = inputWithLabel('Start', 'month', preset.start);
    const end = inputWithLabel('End', 'month', preset.end);
    row2.append(start.label, end.label);

    const details = textareaWithLabel('Details (optional)', preset.details, 3);

    const actions = document.createElement('div');
    actions.className = 'dynamic-actions';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button secondary';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      wrapper.remove();
      updatePreview();
      updateProgressBar();
    });
    actions.appendChild(remove);

    [school.input, degree.input, start.input, end.input, details.textarea].forEach(el => {
      el.addEventListener('input', () => { updatePreview(); updateProgressBar(); });
    });

    wrapper.append(row1, row2, details.label, actions);
    return wrapper;
  }

  function createExperienceRow(preset = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dynamic-item';

    const row1 = document.createElement('div');
    row1.className = 'dynamic-item__row two';
    const company = inputWithLabel('Company', 'text', preset.company);
    const role = inputWithLabel('Role / Title', 'text', preset.role);
    row1.append(company.label, role.label);

    const row2 = document.createElement('div');
    row2.className = 'dynamic-item__row two';
    const start = inputWithLabel('Start', 'month', preset.start);
    const end = inputWithLabel('End', 'month', preset.end);
    row2.append(start.label, end.label);

    const details = textareaWithLabel('Key achievements or responsibilities', preset.details, 4);

    const actions = document.createElement('div');
    actions.className = 'dynamic-actions';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button secondary';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      wrapper.remove();
      updatePreview();
      updateProgressBar();
    });
    actions.appendChild(remove);

    [company.input, role.input, start.input, end.input, details.textarea].forEach(el => {
      el.addEventListener('input', () => { updatePreview(); updateProgressBar(); });
    });

    wrapper.append(row1, row2, details.label, actions);
    return wrapper;
  }

  function inputWithLabel(text, type, value = '') {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = text;
    const input = document.createElement('input');
    input.type = type;
    input.value = value || '';
    label.append(span, input);
    return { label, input };
  }

  function textareaWithLabel(text, value = '', rows = 3) {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = text;
    const textarea = document.createElement('textarea');
    textarea.rows = rows;
    textarea.value = value || '';
    label.append(span, textarea);
    return { label, textarea };
  }

  function updatePreviewHeader() {
    const name = (inputs.name.value || '').trim();
    preview.name.textContent = name.length > 0 ? name : 'Your Name';

    const parts = [];
    const email = (inputs.email.value || '').trim();
    const phone = (inputs.phone.value || '').trim();
    if (email.length > 0) parts.push(email);
    if (phone.length > 0) parts.push(phone);
    preview.contact.textContent = parts.length > 0 ? parts.join(' • ') : 'email@example.com • (000) 000-0000';
  }

  function updatePreviewSummary() {
    const text = (inputs.summary.value || '').trim();
    if (text.length === 0) {
      preview.summary.textContent = 'Write a short, impactful summary that highlights your experience, strengths, and what you are looking for.';
      preview.sectionSummary.style.display = '';
    } else {
      preview.summary.textContent = text;
      preview.sectionSummary.style.display = '';
    }
  }

  function updatePreviewSkills() {
    preview.skills.innerHTML = '';
    const items = Array.from(skills.selected);
    if (items.length === 0) {
      preview.sectionSkills.style.display = 'none';
      return;
    }
    preview.sectionSkills.style.display = '';
    items.sort().forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      preview.skills.appendChild(li);
    });
  }

  function updatePreviewEducation() {
    preview.edu.innerHTML = '';
    const rows = Array.from(dynamic.educationList.children);
    if (rows.length === 0) {
      preview.sectionEducation.style.display = 'none';
      return;
    }
    preview.sectionEducation.style.display = '';
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input, textarea');
      const [school, degree, start, end, details] = inputs;
      const item = document.createElement('div');
      item.className = 'timeline-item';
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = `${(degree.value || '').trim()} ${degree.value && school.value ? '•' : ''} ${(school.value || '').trim()}`.trim();
      const meta = document.createElement('div');
      meta.className = 'meta';
      const startText = (start.value || '').trim();
      const endText = (end.value || '').trim();
      meta.textContent = [startText, endText].filter(Boolean).join(' – ');
      const desc = document.createElement('div');
      desc.textContent = (details.value || '').trim();
      item.append(title, meta);
      if (desc.textContent.length > 0) item.appendChild(desc);
      preview.edu.appendChild(item);
    });
  }

  function updatePreviewExperience() {
    preview.exp.innerHTML = '';
    const rows = Array.from(dynamic.experienceList.children);
    if (rows.length === 0) {
      preview.sectionExperience.style.display = 'none';
      return;
    }
    preview.sectionExperience.style.display = '';
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input, textarea');
      const [company, role, start, end, details] = inputs;
      const item = document.createElement('div');
      item.className = 'timeline-item';
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = `${(role.value || '').trim()} ${role.value && company.value ? '•' : ''} ${(company.value || '').trim()}`.trim();
      const meta = document.createElement('div');
      meta.className = 'meta';
      const startText = (start.value || '').trim();
      const endText = (end.value || '').trim();
      meta.textContent = [startText, endText].filter(Boolean).join(' – ');
      const desc = document.createElement('div');
      desc.textContent = (details.value || '').trim();
      item.append(title, meta);
      if (desc.textContent.length > 0) item.appendChild(desc);
      preview.exp.appendChild(item);
    });
  }

  function updatePreview() {
    updatePreviewHeader();
    updatePreviewSummary();
    updatePreviewSkills();
    updatePreviewEducation();
    updatePreviewExperience();
  }

  function addEducation() {
    const row = createEducationRow();
    dynamic.educationList.appendChild(row);
    updatePreview();
    updateProgressBar();
  }

  function addExperience() {
    const row = createExperienceRow();
    dynamic.experienceList.appendChild(row);
    updatePreview();
    updateProgressBar();
  }

  function clearAll() {
    form.reset();
    skills.selected.clear();
    renderSelectedSkills();
    dynamic.educationList.innerHTML = '';
    dynamic.experienceList.innerHTML = '';
    updatePreview();
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupEvents() {
    Object.values(inputs).forEach(el => {
      el.addEventListener('input', () => { updatePreview(); updateProgressBar(); });
    });

    skills.checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) skills.selected.add(cb.value); else skills.selected.delete(cb.value);
        renderSelectedSkills();
        updatePreview();
        updateProgressBar();
      });
    });
    skills.customInput.addEventListener('keydown', handleCustomSkillInput);

    dynamic.addEducationBtn.addEventListener('click', addEducation);
    dynamic.addExperienceBtn.addEventListener('click', addExperience);

    buttons.clear.addEventListener('click', clearAll);
    buttons.print.addEventListener('click', () => window.print());

    // Live on first paint
    updatePreview();
    updateProgressBar();
  }

  setupEvents();

  // Template switching logic
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('templateSelect').addEventListener('change', function(e) {
      const resume = document.getElementById('resumePreview');
      resume.classList.remove('classic', 'modern', 'minimal');
      resume.classList.add(e.target.value);
    });
    // Set default template
    const templateSelect = document.getElementById('templateSelect');
    const resumePreview = document.getElementById('resumePreview');
    if (templateSelect && resumePreview) {
      resumePreview.classList.add(templateSelect.value);
    }
  });
})();

