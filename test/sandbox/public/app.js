document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  var elA   = document.querySelector('#area-a');
  var elB   = document.querySelector('#area-b');
  var ws    = new WebSocket('ws://' + window.location.host);
  var share = new sharejs.Connection(ws);
  var doc   = share.get('docs', 'sandbox');

  doc.subscribe();

  doc.whenReady(function onReady() {
    console.log('doc ready, data:', doc.getSnapshot());

    if (!doc.type) { doc.create('text'); }
    doc.attachTextarea(elA);
    doc.attachTextarea(elB);
  });
});
