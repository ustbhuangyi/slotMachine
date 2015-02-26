define(function(require){

  require('slotmachine');

  var $slot = $('#slotMachine').slotmachine({
    prizeUrl: 'image/slot-prize.png',
    bgUrl: 'image/slot-bg.jpg',
    count: 6,
    handle: true,
    lights: true
  });
  $slot.on('slotmachinestart', function () {
    console.log('start');
    $slot.slotmachine('setResult', 0);
  }).on('slotmachinerunning', function () {
    console.log('running');
  }).on('slotmachineend', function () {
    console.log('end');
  });
});
