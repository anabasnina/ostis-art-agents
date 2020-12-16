/* --- src/opinion_adding-common.js --- */
'use strict';

var opinion_adding = {};
var fs = require('fs');

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/opinion_adding-paintPanel.js --- */
/**
 * Paint panel.
 */

opinion_adding.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

opinion_adding.PaintPanel.prototype = {


    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);
	 var self = this;

                container.append('<div class="sc-no-default-cmd_add">Агент добавления комментариев к театрам</div>');
                container.append('Выберите театр:</br>');
		container.append('<select id="teatr"><option value = ""> </option></select><br>');
                container.append('Комментарий:</br>');
		container.append('<textarea rows="5" cols="20" name="text" id="opinion_add"></textarea></br>');
		container.append('<button id="add_opinion" type="button">Добавить</button></br>');
                
                self._findOptions('teatr', 'processor');

          $('#add_opinion').click(function () {
               if(isValidUserInputTheatre()){
                  self._generateNodesProcessor();
               } else alert('Необходимые данные для работы: театр, комментарий!');
          });
    },



    _generateNodesProcessor: function () {
     var construction_value = document.getElementById("teatr").value;
     var opinion_value = document.getElementById("opinion_add").value;

     var keynodes_to_search = ['processor', 'nrel_comment', 'opinion'];

		SCWeb.core.Server.resolveScAddr(keynodes_to_search, function (keynodes) {
                     SCWeb.core.Server.findIdentifiersSubStr(construction_value, function (data) {
                        if(data.main.length != 0){
                             var numb = data.main[0][0];
                             window.scHelper.getSystemIdentifier(numb).done(function (element) {
                                  var construction_concept = keynodes['concept_construction'];
                                  var opinion_concept = keynodes['opinion'];
                                  var nrel_comment = keynodes['nrel_comment'];
                                 
                                  if(opinion_value != ""){
                                        window.sctpClient.create_link().done(function (linkComment) {
			                     window.sctpClient.set_link_content(linkComment, opinion_value);
                                             window.sctpClient.create_arc(sc_type_const, numb, linkComment).done(function (generatedCommonArc) {
                                                   window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_comment, generatedCommonArc);
                                             });
                                             window.sctpClient.create_arc(sc_type_arc_pos_const_perm, opinion_concept, linkComment);
                                             addTextValueScsTheatre(element, opinion_value, 'nrel_comment'); 
			                });
                                  }
                             });
                         }   
                     });
                });   
	},

_findOptions : function (element_id, sc_addr) {
        var selectField = document.getElementById(element_id);
        SCWeb.core.Server.resolveScAddr([sc_addr],function(keynodes){
		var sc_addr_numb = keynodes[sc_addr];
		window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A,[
			sc_addr_numb,
			sc_type_arc_pos_const_perm,
                        0]).done(function(element_of_addr){
				for (var count = 0; count < element_of_addr.length; count++){
				     window.scHelper.getIdentifier(element_of_addr[count][2],SCWeb.core.Server._current_language).done(function (name) { 
                                         selectField.innerHTML += '<option value="' + name + '">' + name + '</option>';
				     })
				}
		});
	});
},

};

function isValidUserInputTheatre() {
    if (document.getElementById("opinion_add").value == "" || document.getElementById("teatr").value == "") {
        return false;
    }
    return true;
}


/* --- src/opinion_adding-fileWriter.js --- */
function addTextValueScsTheatre(idtf, value, nrel) {
    let opinionPath = '/home/exhale/ostisihs/kb/teatr/opinions/opinions.scs'
    let template = idtf + ' => ' + nrel + ': [' + value + '];;' + '\n';

    fs.appendFileSync(opinionPath, template);
}


/* --- src/opinion_adding-component.js --- */
/**

 * Cpu Adding component.
 */

opinion_adding.DrawComponent = {
    ext_lang: 'opinion_adding',
    formats: ['format_opinion_adding_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new opinion_adding.DrawWindow(sandbox);
    }
};

opinion_adding.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new opinion_adding.PaintPanel(this.sandbox.container);
    this.paintPanel.init();
    this.recieveData = function (data) {
        console.log("in recieve data" + data);
    };

    var scElements = {};

    function drawAllElements() {
        var dfd = new jQuery.Deferred();
       // for (var addr in scElements) {
            jQuery.each(scElements, function(j, val){
                var obj = scElements[j];
                if (!obj || obj.translated) return;
// check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    var begin = obj.data.begin;
                    var end = obj.data.end;
                    // logic for component update should go here
                }

        });
        SCWeb.ui.Locker.hide();
        dfd.resolve();
        return dfd.promise();
    }

// resolve keynodes
    var self = this;
    this.needUpdate = false;
    this.requestUpdate = function () {
        var updateVisual = function () {
// check if object is an arc
            var dfd1 = drawAllElements();
            dfd1.done(function (r) {
                return;
            });


/// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            if (self.needUpdate)
                self.requestUpdate();
            return dfd1.promise();
        };
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            SCWeb.ui.Locker.show();
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    
    this.eventStructUpdate = function (added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t;
                var obj = new Object();
                obj.data = new Object();
                obj.data.type = type;
                obj.data.addr = addr;
                if (type & sc_type_arc_mask) {
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a[0];
                        obj.data.end = a[1];
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                }
            });
        });
    };
// delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
    this.sandbox.updateContent();
};
SCWeb.core.ComponentManager.appendComponentInitialize(opinion_adding.DrawComponent);


