/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var vrView;

// All the scenes for the experience
var scenes = {};


function onLoad() {

  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = responseHandler; 
  xmlhttp.open('GET', space_url, true);
  xmlhttp.send();

  console.log('onLoad');
}


function responseHandler() {

  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

    obj = JSON.parse(xmlhttp.responseText);

    if (typeof obj['photo-spheres'] !== 'undefined') {
      for (var i=0; i<obj['photo-spheres'].length; i++) {

        var photosphere = {
          image: obj['photo-spheres'][i]['photo-sphere']['#uri']['#value'],
          preview: obj['photo-spheres'][i]['photo-sphere']['preview-photosphere']['#uri']['#value'],
          is_stereo: ((obj['photo-spheres'][i]['mono-stereo-select']['#value']=='stereo')?true:false)
        };
        scenes[obj['photo-spheres'][i]['photo-sphere']['#content-id']] = photosphere;
      } 
    } 


    if (typeof obj['photo-spheres'] !== 'undefined' && obj['photo-spheres'].length > 0) {

      vrView = new VRView.Player('#vrview', {
        image: blank_img_url,
        preview: blank_img_url,
        default_yaw: 0,
        is_debug: false,
        is_stereo: false,
        is_autopan_off: false
      });

      vrView.on('ready', onVRViewReady);
      vrView.on('modechange', onModeChange);
      vrView.on('error', onVRViewError);
    }
  }
}


function onVRViewReady(e) {

  console.log('onVRViewReady');

  // Create the carousel links
  var carouselItems = document.querySelectorAll('ul.carousel li a');
  for (var i = 0; i < carouselItems.length; i++) {
    var item = carouselItems[i];
    item.disabled = false;

    item.addEventListener('click', function(event) {
      event.preventDefault();
      loadScene(event.target.parentNode.getAttribute('href').substring(1));
    });
  }

  loadScene(obj['photo-spheres'][0]['photo-sphere']['#content-id']);
}

function onModeChange(e) {
  console.log('onModeChange', e.mode);
}

function loadScene(id) {
  console.log('loadScene', id);

  // Set the image
  vrView.setContent({
    image: scenes[id].image,
    preview: scenes[id].preview,
    is_stereo: scenes[id].is_stereo,
    is_autopan_off: true
  });

  // Unhighlight carousel items
  var carouselLinks = document.querySelectorAll('ul.carousel li a');
  for (var i = 0; i < carouselLinks.length; i++) {
    carouselLinks[i].classList.remove('current');
  }

  // Highlight current carousel item
  document.querySelector('ul.carousel li a[href="#' + id + '"]').classList.add('current');
}

function onVRViewError(e) {
  console.log('Error! %s', e.message);
}

window.addEventListener('load', onLoad);

