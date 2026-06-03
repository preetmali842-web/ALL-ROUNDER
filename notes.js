function initNotes(){ renderNotesView(); }
function renderNotesView(){
  const root = qs('#view-notes');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head"><h3>Create Note</h3><span>Search and autosave</span></div>
        <div class="row two">
          <input class="input" id="noteTitle" placeholder="Note title">
          <button class="action-btn" id="saveNoteBtn">Save Note</button>
        </div>
        <textarea class="input" id="noteBody" placeholder="Write your note here..."></textarea>
        <div class="row two" style="margin-top:12px">
          <input class="input" id="noteSearch" placeholder="Search notes">
          <button class="action-btn secondary" id="clearNoteForm">Clear</button>
        </div>
      </div>
      <div class="glass section-card">
        <div class="section-head"><h3>Your Notes</h3><span id="noteCount">0 notes</span></div>
        <div id="noteList" class="grid" style="gap:10px"></div>
      </div>
    </div>
  `;
  qs('#saveNoteBtn').onclick = saveNote;
  qs('#clearNoteForm').onclick = () => { qs('#noteTitle').value=''; qs('#noteBody').value=''; };
  qs('#noteSearch').oninput = drawNotes;
  drawNotes();
}
function saveNote(){
  const title = qs('#noteTitle').value.trim();
  const body = qs('#noteBody').value.trim();
  if(!title && !body) return;
  const notes = JSON.parse(localStorage.getItem('scp_notes') || '[]');
  notes.unshift({ id: Date.now(), title, body, createdAt: Date.now() });
  localStorage.setItem('scp_notes', JSON.stringify(notes));
  qs('#noteTitle').value = ''; qs('#noteBody').value = '';
  drawNotes();
}
function drawNotes(){
  const notes = JSON.parse(localStorage.getItem('scp_notes') || '[]');
  const q = (qs('#noteSearch')?.value || '').toLowerCase();
  const filtered = notes.filter(n => `${n.title} ${n.body}`.toLowerCase().includes(q));
  qs('#noteCount').textContent = `${filtered.length} notes`;
  qs('#noteList').innerHTML = filtered.map(n => `
    <div class="note-item glass section-card">
      <div class="section-head">
        <div>
          <h3 style="margin:0">${n.title || 'Untitled Note'}</h3>
          <div class="note-meta">${new Date(n.createdAt).toLocaleString()}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="action-btn secondary" data-note-edit="${n.id}">Edit</button>
          <button class="action-btn danger" data-note-del="${n.id}">Delete</button>
        </div>
      </div>
      <div style="white-space:pre-wrap;line-height:1.6">${n.body}</div>
    </div>
  `).join('') || '<div class="muted">No notes found.</div>';
  qs('#view-notes').onclick = noteActions;
}
function noteActions(e){
  const id = e.target.dataset.noteEdit || e.target.dataset.noteDel;
  if(!id) return;
  let notes = JSON.parse(localStorage.getItem('scp_notes') || '[]');
  if(e.target.dataset.noteDel){
    notes = notes.filter(n => String(n.id) !== String(id));
    localStorage.setItem('scp_notes', JSON.stringify(notes));
    drawNotes();
  } else if(e.target.dataset.noteEdit){
    const n = notes.find(x => String(x.id) === String(id));
    const title = prompt('Edit title', n.title);
    if(title === null) return;
    const body = prompt('Edit note', n.body);
    if(body === null) return;
    n.title = title;
    n.body = body;
    localStorage.setItem('scp_notes', JSON.stringify(notes));
    drawNotes();
  }
}