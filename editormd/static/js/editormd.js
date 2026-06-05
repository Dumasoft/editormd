const SymbolMdEnum = {
    BOLD: '**',
    ITALIC: '_',
    LI: '- ',
    OL: '1. ',
    LI_CHECKED: '- [ ] ',
    H1: '# ',
    H2: '## ',
    H3: '### ',
    H4: '#### ',
    H5: '##### ',
    H6: '###### ',
    QUOTE: '> ',
    CODE: '```',
    CODE_INLINE: '`',
    LINK: '[title](https://)',
    IMAGE: '![alt](https://)',
    RESALT_QUOTE_START: '<span style="color: #4A9A6E">**',
    RESALT_AUTHOR_START: '<span style="color: #B079AB">**',
    END_SPAN: '**</span>',
};

const SymbolButtonEnum = {
    BOLD: 'md-bold',
    ITALIC: 'md-italic',
    LI: 'md-li',
    OL: 'md-ol',
    LI_CHECKED: 'md-list-check',
    H1: 'md-h1',
    H2: 'md-h2',
    H3: 'md-h3',
    H4: 'md-h4',
    H5: 'md-h5',
    H6: 'md-h6',
    H: 'md-h',
    QUOTE: 'md-quote',
    CODE: 'md-code',
    CODE_INLINE: 'md-code-inline',
    RESALT_QUOTE: 'md-resalt-quote',
    RESALT_AUTHOR: 'md-resalt-author',
};

const HIGHLIGHT_RULES = [
    {
        start: SymbolMdEnum.RESALT_QUOTE_START,
        end: SymbolMdEnum.END_SPAN,
        color: '#4A9A6E',
    },
    {
        start: SymbolMdEnum.RESALT_AUTHOR_START,
        end: SymbolMdEnum.END_SPAN,
        color: '#B079AB'
    }
];

const escape_html = (text) =>
    text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

const escape_regex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function build_hightlight_html(value) {
    let html = escape_html(value);

    for (const rule of HIGHLIGHT_RULES) {
        const start = escape_html(rule.start);
        const end = escape_html(rule.end);
        const re = new RegExp(escape_regex(start) + '([\\s\\S]*?)' + escape_regex(end), 'g');
        html = html.replace(re, (match) => `<span style="color:${rule.color}">${match}</span>`);
    }

    return html + '\n';
}

function get_csrf() {
    const csrf_input = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return csrf_input ? csrf_input.value : '';
}

function get_headers_csrf() {
    return {
        'X-CSRFToken': get_csrf(),
        'X-Requested-With': 'XMLHttpRequest'
    };
}

class History {
    constructor(editor, on_change) {
        this.editor = editor;
        this.on_change = on_change;
        this.typing = false;
        this.timer = 0;

        this.future = [];
        this.past = [];
    }

    snap() {
        return {
            value: this.editor.value,
            start: this.editor.selectionStart,
            end: this.editor.selectionEnd,
        };
    }

    record() {
        this.past.push(this.snap());
        this.future = [];
    }

    record_typing() {
        if (!this.typing) {
            this.typing = true;
            this.record();
        }
        clearTimeout(this.timer);
        this.timer = window.setTimeout(() => (this.typing = false), 500);
    }

    undo() {
        const prev = this.past.pop();
        if (!prev) return;
        this.future.push(this.snap());
        this.apply(prev);
    }

    redo() {
        const next = this.future.pop();
        if (!next) return;
        this.past.push(this.snap());
        this.apply(next);
    }

    apply(s) {
        this.editor.value = s.value;
        this.editor.setSelectionRange(s.start, s.end);
        this.on_change();
    }
}

class MarkdownConversor {
    constructor() { }

    preview(url) {
        const editor = document.getElementById('md-editor');
        const formdata = new FormData();
        const headers = get_headers_csrf();
        formdata.append('markdown_text', editor?.value || '');

        if (url) {
            fetch(url, {method: 'POST', body: formdata, headers: headers})
                .then((response) => response.json())
                .then((data) => {
                    const div_preview = document.getElementById('md-preview');
                    if (div_preview) {
                        div_preview.innerHTML = data.html;
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
        }
    }
}

class MDEditor {
    constructor() {
        const editor = document.getElementById(this.id_editor);
        const backdrop = document.getElementById(this.id_backdrop);

        this.selection_start = 0;
        this.selection_end = 0;
        this.id_editor = 'md-editor';
        this.id_backdrop = 'md-backdrop';

        if (!editor || !backdrop) return;

        this.editor = editor;
        this.backdrop = backdrop;
        this.history = new History(this.editor, () => this.render());

        this.prepare_highlight();
        this.prepare_buttons();
        this.prepare_tab();
        this.prepare_shortcuts();
        this.render();
    }

    prepare_buttons() {
        this.set_symbol_resalt_text(SymbolMdEnum.CODE, SymbolButtonEnum.CODE);
        this.set_symbol_resalt_text(SymbolMdEnum.BOLD, SymbolButtonEnum.BOLD);
        this.set_symbol_resalt_text(SymbolMdEnum.ITALIC, SymbolButtonEnum.ITALIC);
        this.set_symbol_start_line(SymbolMdEnum.H1, SymbolButtonEnum.H);
        this.set_symbol_start_line(SymbolMdEnum.QUOTE, SymbolButtonEnum.QUOTE);
        this.set_symbol_start_line(SymbolMdEnum.LI, SymbolButtonEnum.LI);
        this.set_symbol_start_line(SymbolMdEnum.OL, SymbolButtonEnum.OL);
        this.set_symbol_start_line(SymbolMdEnum.LI_CHECKED, SymbolButtonEnum.LI_CHECKED);
        this.assign_resalt(SymbolMdEnum.RESALT_QUOTE_START, SymbolButtonEnum.RESALT_QUOTE);
        this.assign_resalt(SymbolMdEnum.RESALT_AUTHOR_START, SymbolButtonEnum.RESALT_AUTHOR);
    }

    prepare_highlight() {
        this.editor.addEventListener('beforeinput', () => this.history.record_typing());
        this.editor.addEventListener('input', () => this.render());
        this.editor.addEventListener('scroll', () => this.sync_scroll());
    }

    render() {
        this.backdrop.innerHTML = build_hightlight_html(this.editor.value);
        this.sync_scroll();
    }

    sync_scroll() {
        this.backdrop.scrollTop = this.editor.scrollTop;
        this.backdrop.scrollLeft = this.editor.scrollLeft;
    }

    assign_resalt(symbol_start, id) {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.wrap(symbol_start, SymbolMdEnum.END_SPAN);
                this.focus_in_editor();
            })
        }
    }

    set_symbol_resalt_text(symbol, id) {
        const button = document.getElementById(id)

        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.wrap(symbol, symbol);
                this.focus_in_editor();
            })
        }
    }

    set_symbol_start_line(symbol, id) {
        const button = document.getElementById(id)

        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.prefix_lines(symbol);
                this.focus_in_editor();
            })
        }
    }

    prepare_tab() {
        this.editor.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                const pos = this.editor.selectionStart;
                this.replace_range(pos, this.editor.selectionEnd, '    ', pos + 4, pos + 4);
            }
        })
    }

    prepare_shortcuts() {
        this.editor.addEventListener('keydown', (event) => {
            const mod = event.ctrlKey || event.metaKey;
            if (!mod) return;
            const key = event.key.toLowerCase();

            if (key === 'z' && !event.shiftKey) {
                event.preventDefault();
                this.history.undo();
            } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
                event.preventDefault();
                this.history.redo();
            } else if (key === 'b') {
                event.preventDefault();
                this.wrap(SymbolMdEnum.BOLD, SymbolMdEnum.BOLD);
                this.focus_in_editor();
            } else if (key === 'i') {
                event.preventDefault();
                this.wrap(SymbolMdEnum.ITALIC, SymbolMdEnum.ITALIC);
                this.focus_in_editor();
            }
        })
    }

    get_selected_text() {
        this.selection_start = this.editor.selectionStart;
        this.selection_end = this.editor.selectionEnd;
        return this.editor.value.substring(this.selection_start, this.selection_end);
    }

    get_start_of_line_index() {
        return this.editor.value.lastIndexOf('\n', this.editor.selectionStart - 1) + 1;
    }

    replace_range(start, end, text, cursor_start, cursor_end) {
        this.history.record();
        this.editor.setRangeText(text, start, end, 'end');
        this.editor.setSelectionRange(cursor_start, cursor_end);
        this.render();
    }

    wrap(before, after) {
        const text = this.get_selected_text();
        const start = this.selection_start;
        this.replace_range(
            start, this.selection_end, before + text + after,
            start + before.length, start + before.length + text.length
        )
    }

    prefix_lines(prefix) {
        const start = this.get_start_of_line_index();
        const end = this.editor.selectionEnd;
        const block = this.editor.value.substring(start, end);
        const prefixed = block.split('\n').map((line) => prefix + line).join('\n');
        this.replace_range(start, end, prefixed, start + prefix.length, start + prefixed.length);
    }

    focus_in_editor() {
        this.editor.focus();
    }
}

new MDEditor();

console.log('cargando editor desde la librería')