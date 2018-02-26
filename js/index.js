var toolbarOptions = [
    ['formula'],
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
    [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
    [{'direction': 'rtl'}],                         // text direction
    [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
    [{'header': [1, 2, 3, 4, 5, 6, false]}],
    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    [{'font': []}],
    [{'align': []}]
    // ['clean']
];

var editorContentChanged = false;
var editor = new Quill('#editor', {
    modules: {
        formula: true,
        toolbar: toolbarOptions
    },
    placeholder: 'start writing here...',
    theme: 'snow'
});

editor.on('editor-change', function (eventName) {
    editorContentChanged = true;
    ipc.send('contentChanged', 'content changed');
    // if (eventName === 'text-change') {
    //     // args[0] will be delta
    // } else if (eventName === 'selection-change') {
    //     // args[0] will be old range
    // }
});

var ipc = require('electron').ipcRenderer;

ipc.once('actionReply', function (event, response) {
});

ipc.on('showFormula', function (event, arg) {
    $('.ql-formula')[0].click();
    ipc.send('invokeAction', 'formula should be shown');
});

ipc.on('getContent', function (event, arg) {
    if(arg) {
        $('#new-file').click();
    } else {
        ipc.send('saveFile', editor.root.innerHTML);
    }
});

ipc.on('setContent', function (event, arg) {
    editor.root.innerHTML = arg;
});

ipc.on('setTitle', function (event, arg) {
    // editor.root.innerHTML = arg;
    document.title = 'Math Editor - ' + arg;
});

$(function () {
    $('#new-file').click(function (e) {
        e.preventDefault();
        if(editorContentChanged===false) {
            return;
        }
        if(confirm('do you really want to open new file?')) {
            ipc.send('newFile', editor.root.innerHTML);
            editor.root.innerHTML = '';
        }
    });

    $('#open-file').click(function (e) {
        e.preventDefault();
        ipc.send('openFile', editor.root.innerHTML);
    });

    $('#save-file').click(function (e) {
        e.preventDefault();
        if(editorContentChanged===false) {
            return;
        }
        ipc.send('saveFile', editor.root.innerHTML);
    });

    $('#math-help').click(function (e) {
        e.preventDefault();
        ipc.send('openMathHelp', editor.root.innerHTML);
    });

    $('#general-help').click(function (e) {
        e.preventDefault();
        ipc.send('openHelp', editor.root.innerHTML);
    });
});