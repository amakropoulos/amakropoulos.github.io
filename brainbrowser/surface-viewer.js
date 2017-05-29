/*
* BrainBrowser: Web-based Neurological Visualization Tools
* (https://brainbrowser.cbrain.mcgill.ca)
*
* Copyright (C) 2011
* The Royal Institution for the Advancement of Learning
* McGill University
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
* Author: Tarek Sherif <tsherif@gmail.com> (http://tareksherif.ca/)
* Author: Nicolas Kassis
*/

// This script is meant to be a demonstration of how to
// use most of the functionality available in the
// BrainBrowser Surface Viewer.
$(function() {
  "use strict";

  var THREE = BrainBrowser.SurfaceViewer.THREE;
  var atlas_labels = {};

  // Request variables used to cancel the current request
  // if another request is started.
  var current_request = 0;
  var current_request_name = "";

  // Hide or display loading icon.
  var loading_div = $("#loading");
  function showLoading() { loading_div.show(); }
  function hideLoading() { loading_div.hide(); }
  function loadSurface(name) {
      current_request++;

      var matrixRotX, matrixRotY, matrixRotZ;

      if (current_request_name === name) return;
      current_request_name = name;

      //Create a closure to compare current request number to number
      // at the time request was sent.
      function defaultCancelOptions(request_number) {
        return function() { return request_number !== current_request; };
      }

      loading_div.show();
      viewer.clearScreen();

          viewer.annotations.setMarkerRadius(1);
          viewer.loadModelFromURL("models/age-"+name+".lh+rh.surf-reduced.asc", {
            format: "freesurferasc",
            complete: function() {
              $("#vertex-data-wrapper").show();
              //$("#pick-value-wrapper").show();
              $("#pick-label-wrapper").show();
              viewer.loadIntensityDataFromURL("models/age-"+name+".lh+rh.labels-reduced.txt", {
                max: 18.5,
                complete: hideLoading
              });
              viewer.setView("lateral");
              viewer.zoom = 2;
            },
            cancel: defaultCancelOptions(current_request),
            parse: { split: true }
          });

      return false;
    }


  // Make sure WebGL is available.
  if (!BrainBrowser.WEBGL_ENABLED) {
    $("#brainbrowser").html(BrainBrowser.utils.webGLErrorMessage());
    return;
  }

  $.get("models/DrawEM.txt", function(data) {
    var lines = data.toString().split("\n");
    var regex = /'(.+)'\s+(\d+)/;

    lines.forEach(function(line) {
      var match = line.match(regex);
      if (match) {
        atlas_labels[match[2]] = match[1];
      }
    });
  }, 'text');

  /////////////////////////////////////
  // Start running the Surface Viewer
  /////////////////////////////////////
  window.viewer = BrainBrowser.SurfaceViewer.start("brainbrowser", function(viewer) {

    var picked_object = null;

    // Add the three.js 3D anaglyph effect to the viewer.
    viewer.addEffect("AnaglyphEffect");

    ///////////////////////////////////
    // Event Listeners
    ///////////////////////////////////

    // If something goes wrong while loading, we don't
    // want the loading icon to stay on the screen.
    BrainBrowser.events.addEventListener("error", hideLoading);

    // When the screen is cleared, remove all UI related
    // to the displayed models.
    viewer.addEventListener("clearscreen", function() {
      $("#vertex-data-wrapper").hide();
      $("#pick-label-wrapper").hide();
      $("#pick-label").html("");
      $("#intensity-data-export").hide();
      viewer.annotations.reset();
      picked_object = null;
    });

    // When the intensity range changes, adjust the displayed spectrum.
    viewer.addEventListener("changeintensityrange", function(event) {
      var intensity_data = event.intensity_data;
      var canvas = viewer.color_map.createElement(intensity_data.range_min, intensity_data.range_max);
      canvas.id = "spectrum-canvas";
      $("#color-bar").html(canvas);
    });

    // When new intensity data is loaded, create all UI related to
    // controlling the relationship between the instensity data and
    // the color mapping (range, flip colors, clamp colors, fix range).
    viewer.addEventListener("loadintensitydata", function(event) {
      var model_data = event.model_data;
      var intensity_data = event.intensity_data;
      var container = $("#data-range");
      var headers = '<div id="data-range-multiple"><ul>';
      var controls = "";
      var i, count;
      var data_set = model_data.intensity_data;

      container.html("");
      for(i = 0, count = data_set.length; i < count; i++) {
        headers += '<li><a href="#data-file' + i + '">' + data_set[i].name + '</a></li>';
        controls += '<div id="data-file' + i + '" class="box range-controls">';
        controls += 'Min: <input class="range-box" id="data-range-min" type="text" name="range_min" size="5" >';
        controls += '<div id="range-slider' + i + '" data-blend-index="' + i + '" class="slider"></div>';
        controls += 'Max: <input class="range-box" id="data-range-max" type="text" name="range_max" size="5">';
        controls += '<input type="checkbox" class="button" id="fix_range"' +
                    (viewer.getAttribute("fix_color_range") ? ' checked="true"' : '') +
                    '><label for="fix_range">Fix Range</label>';
        controls += '<input type="checkbox" class="button" id="clamp_range"' +
                    (viewer.color_map && viewer.color_map.clamp ? ' checked="true"' : '') +
                    '><label for="clamp_range">Clamp range</label>';
        controls += '<input type="checkbox" class="button" id="flip_range"' +
                    (viewer.color_map && viewer.color_map.flip ? ' checked="true"' : '') +
                    '><label for="flip_range">Flip Colors</label>';
        controls += '</div>';
      }
      headers += "</ul>";


      container.html(headers + controls + "</div>");

      container.find(".range-controls").each(function(index) {
        var controls = $(this);
        var intensity_data = data_set[index];

        var data_min = intensity_data.min;
        var data_max = intensity_data.max;
        var range_min = intensity_data.range_min;
        var range_max = intensity_data.range_max;
        var min_input = controls.find("#data-range-min");
        var max_input = controls.find("#data-range-max");
        var slider = controls.find(".slider");

        slider.slider({
          range: true,
          min: data_min,
          max: data_max,
          values: [range_min, range_max],
          step: (range_max - range_min) / 100.0,
          slide: function(event, ui) {
            var min = ui.values[0];
            var max = ui.values[1];
            min_input.val(min);
            max_input.val(max);
            intensity_data.range_min = min;
            intensity_data.range_max = max;

            viewer.setIntensityRange(intensity_data, min, max);
          }
        });

        slider.slider("values", 0, parseFloat(range_min));
        slider.slider("values", 1, parseFloat(range_max));
        min_input.val(range_min);
        max_input.val(range_max);

        function inputRangeChange() {
          var min = parseFloat(min_input.val());
          var max = parseFloat(max_input.val());

          slider.slider("values", 0, min);
          slider.slider("values", 1, max);
          viewer.setIntensityRange(intensity_data, min, max);
        }

        $("#data-range-min").change(inputRangeChange);
        $("#data-range-max").change(inputRangeChange);

        $("#fix_range").click(function() {
          viewer.setAttribute("fix_color_range", $(this).is(":checked"));
        });

        $("#clamp_range").change(function() {
          var min = parseFloat(min_input.val());
          var max = parseFloat(max_input.val());

          if (viewer.color_map) {
            viewer.color_map.clamp = $(this).is(":checked");
          }

          viewer.setIntensityRange(intensity_data, min, max);
        });


        $("#flip_range").change(function() {
          var min = parseFloat(min_input.val());
          var max = parseFloat(max_input.val());

          if (viewer.color_map) {
            viewer.color_map.flip = $(this).is(":checked");
          }

          viewer.setIntensityRange(intensity_data, min, max);
        });
      });
    }); // end loadintensitydata listener

    viewer.addEventListener("updatecolors", function(event) {
      var model_data = event.model_data;
      var intensity_data = model_data.intensity_data[0];
      var value = parseFloat($("#pick-value").val());
      var spectrum_div = document.getElementById("color-bar");
      var min, max;
      var canvas;

      if (BrainBrowser.utils.isNumeric(value)) {
        $("#pick-color").css("background-color", "#" + viewer.color_map.colorFromValue(value, {
          hex: true,
          min: intensity_data.range_min,
          max: intensity_data.range_max
        }));
      }

      if (model_data && intensity_data) {
        min = intensity_data.range_min;
        max = intensity_data.range_max;
      } else {
        min = 0;
        max = 100;
      }

      canvas = viewer.color_map.createElement(min, max);
      canvas.id = "spectrum-canvas";
      if (!spectrum_div) {
        $("<div id=\"color-bar\"></div>").html(canvas).appendTo("#data-range-box");
      } else {
        $(spectrum_div).html(canvas);
      }

    });

    viewer.addEventListener("updateintensitydata", function(event) {
      var intensity_data = event.intensity_data;
      var link = $("#intensity-data-export-link");
      var values = Array.prototype.slice.call(intensity_data.values);

      link.attr("href", BrainBrowser.utils.createDataURL(values.join("\n")));
      $("#intensity-data-export-link").attr("download", "intensity-values.txt");
      $("#intensity-data-export").show();
    });

    ////////////////////////////////////
    //  START RENDERING
    ////////////////////////////////////
    viewer.render();

    // Load a color map (required for displaying intensity data).
    viewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps")[0].url);

    ///////////////////////////////////
    // UI
    ///////////////////////////////////

    // Set the background color.
    $("#clear_color").change(function(e){
      viewer.setClearColor(parseInt($(e.target).val(), 16));
    });

    // Set the visibility of the currently loaded model.
    $(".visibility").change(function() {
      var input  = $(this);
      var hemisphere = input.data("hemisphere");
      var shape = viewer.model.getObjectByName(hemisphere);

      if (!shape) return;

      shape.visible = input.is(":checked");
      viewer.updated = true;
    });

    // Set the view type (medial, lateral,
    // inferior, anterior, posterior).
    $("[name=hem_view]").change(function() {
      viewer.setView($("[name=hem_view]:checked").val());
    });

    // Control autorotation.
    $("#autorotate-controls").children().change(function() {
      viewer.autorotate.x = $("#autorotateX").is(":checked");
      viewer.autorotate.y = $("#autorotateY").is(":checked");
      viewer.autorotate.z = $("#autorotateZ").is(":checked");
    });


    $("#brainbrowser").click(function(event) {
     // if (!event.shiftKey && !event.ctrlKey) return;
      if (viewer.model.children.length === 0) return;

      var pick_info = viewer.pick();
      var model_data, intensity_data;
      var annotation_info;
      var value, label, text;

      if (pick_info) {

        picked_object = pick_info.object;
        model_data = viewer.model_data.get(picked_object.userData.model_name);
        intensity_data = model_data.intensity_data[0];

        if (intensity_data) {
          value = intensity_data.values[pick_info.index];
          label = atlas_labels[value];
          if (label) {
            text = label;
          } else {
            text = "None";
          }
          $("#pick-label").html(text);
        }
      } 
    });

  $(function() {
    $( "#ageslider" ).slider({
        range: "min",
        value: 38,
        min: 32,
        max: 44,
	step: 2,
       slide: function( event, ui ) {
          $( "#range" ).html( ui.value );
       },
       change: function( event, ui ) {
          loadSurface( ui.value );
       }
	});
  });

    $(window).resize(function() {
      viewer.updateViewport();
    });

    // Load first model.
    loadSurface(40);
    // autorotate
    viewer.autorotate.z = true;

  });
});

