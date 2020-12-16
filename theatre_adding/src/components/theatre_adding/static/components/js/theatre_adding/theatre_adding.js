/* --- src/theatre_adding-common.js --- */
'use strict';

var cpu_adding = {};
var fs = require('fs');

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/theatre_adding-paintPanel.js --- */
/**
 * Paint panel.
 */

cpu_adding.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

cpu_adding.PaintPanel.prototype = {


    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);
	 var self = this;

                container.append('<div class="sc-no-default-cmd_add">Агент добавления театров по заданным характеристикам</div>');
                container.append('Идентификатор:</br>');
		container.append('<input type="text" value="" id="cpu_identifier_add" /></br>');
                container.append('Название:</br>');
		container.append('<input type="text" value="" id="cpu_name_add" /></br>');
		container.append('Основатель:</br>');
		container.append('<input type="text" value="" id="cpu_producer_add" /></br>');
		container.append('Максимальное количество мест:</br>');
		container.append('<input type="text" value="" id="max_flow_quantity_add" /></br>');
		container.append('Год открытия:</br>');
		container.append('<input type="text" value="" id="manufacture_year_add" /></br>');
		container.append('<button id="add_cpus" type="button">Добавить</button></br>');




          $('#add_cpus').click(function () {
               if(isValidUserInput()){
                  self._generateNodesProcessor();
               } else alert('Необходимые данные для работы: Идентификатор, Название!');
          });
    },



    _generateNodesProcessor: function () {

     var idtf_value = document.getElementById("cpu_identifier_add").value;
     var name_value = document.getElementById("cpu_name_add").value;
     var producer_value = document.getElementById("cpu_producer_add").value;
     var maxFlow_value = document.getElementById("max_flow_quantity_add").value;
     var manufactureYear_value = document.getElementById("manufacture_year_add").value;

     var keynodes_to_search = ['teatr', 'nrel_main_idtf', 'sc_node_not_relation','nrel_producer', 'nrel_manufacture_date',
                               'nrel_model_range', 'nrel_code_crystal_name', 'nrel_socket', 'nrel_kernel_quantity', 
                               'nrel_max_flow_quantity','nrel_clock_frequency', 'nrel_turbo_speed', 'nrel_system_idtf', 'quantity',
                               'producer'];

		SCWeb.core.Server.resolveScAddr(keynodes_to_search, function (keynodes) {
			var processor_concept = keynodes['teatr'];
                        var producer_concept = keynodes['producer'];
                        var nrel_producer = keynodes['nrel_producer'];
                        var nrel_manufacture_date = keynodes['nrel_manufacture_date'];
                        var nrel_max_flow_quantity = keynodes['nrel_max_flow_quantity'];
                        var nrel_main_idtf = keynodes['nrel_main_idtf'];
                        var nrel_system_idtf = keynodes['nrel_system_idtf'];
                        var quantity = keynodes['quantity'];
                        var norole_relation = keynodes['sc_node_not_relation'];
                       
                        window.sctpClient.create_node(sc_type_const).done(function (nodeProc) {
                              
                               window.sctpClient.create_link().done(function (linkIdtf) {
			              window.sctpClient.set_link_content(linkIdtf, idtf_value);
                                      window.sctpClient.create_arc(sc_type_const, nodeProc, linkIdtf).done(function (generatedCommonArc) {
                                               window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_system_idtf, generatedCommonArc);
                                      });
                                      window.sctpClient.create_arc(sc_type_arc_pos_const_perm, norole_relation, nodeProc);
                                      addRelationIntoScs(idtf_value, 'sc_node_not_relation');
			       

                               window.sctpClient.create_link().done(function (linkName) {
			              window.sctpClient.set_link_content(linkName, name_value);
                                      window.sctpClient.create_arc(sc_type_const, nodeProc, linkName).done(function (generatedCommonArc) {
                                               window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf, generatedCommonArc);
                                      });
                                      window.sctpClient.create_arc(sc_type_arc_pos_const_perm, processor_concept, nodeProc);
                                      addProcessorConceptIntoScs(idtf_value, name_value, 'processor');
                                      addMainIdtfIntoScs(idtf_value, name_value, 'nrel_main_idtf');
			       });

                               if(producer_value != ""){
                               window.sctpClient.create_link().done(function (linkProducer) {
			              window.sctpClient.set_link_content(linkProducer, producer_value);
                                      window.sctpClient.create_arc(sc_type_const, nodeProc, linkProducer).done(function (generatedCommonArc) {
                                               window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_producer, generatedCommonArc);
                                      });
                                      window.sctpClient.create_arc(sc_type_arc_pos_const_perm, producer_concept, linkProducer);
                                      addJustNrelIntoScs(idtf_value, producer_value, 'nrel_producer'); 
			       });
                               }

                               if(maxFlow_value != ""){
                               window.sctpClient.create_link().done(function (linkMaxFlow) {
			              window.sctpClient.set_link_content(linkMaxFlow, maxFlow_value);
                                      window.sctpClient.create_arc(sc_type_const, nodeProc, linkMaxFlow).done(function (generatedCommonArc) {
                                               window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_max_flow_quantity, generatedCommonArc);
                                      });
                                      window.sctpClient.create_arc(sc_type_arc_pos_const_perm, quantity, linkMaxFlow);
                                      addWithQuantityIntoScs(idtf_value, maxFlow_value, 'nrel_max_flow_quantity');
			       });
                               }

                               if(manufactureYear_value != ""){
                               window.sctpClient.create_link().done(function (linkManufYear) {
			              window.sctpClient.set_link_content(linkManufYear, manufactureYear_value);
                                      window.sctpClient.create_arc(sc_type_const, nodeProc, linkManufYear).done(function (generatedCommonArc) {
                                               window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_manufacture_date, generatedCommonArc);
                                      });
                                      window.sctpClient.create_arc(sc_type_arc_pos_const_perm, quantity, linkManufYear);
                                      addWithYearScs(idtf_value, manufactureYear_value, 'nrel_manufacture_date'); 
			       });
                               }

                            });   
                        });
               });
	},

};

function isValidUserInput() {
    if (document.getElementById("cpu_identifier_add").value == "" || 
        document.getElementById("cpu_name_add").value == "") {
        return false;
    }
    return true;
}


/* --- src/theatre_adding-fileWriter.js --- */
var path = '/home/exhale/ostisihs/kb/teatr/cpus/';

function addRelationIntoScs(idtf, relation) {
    let template = idtf + ' <- ' + relation + ';;' + '\n';

    SCWeb.core.Server.findIdentifiersSubStr(idtf, function (data) {
         if(data.sys.length == 0 && data.main.length == 0 && data.sys.length == 0){
             fs.writeFileSync(path + idtf + '.scs', template);
         }
    });
}

function addProcessorConceptIntoScs(idtf, value, concept) {
    let template = idtf + ' <- ' + concept + ';;' + '\n';

    SCWeb.core.Server.findIdentifiersSubStr(value, function (data) {
         if(data.sys.length == 0 && data.main.length == 0 && data.sys.length == 0){
           fs.appendFileSync(path + idtf + '.scs', template);  
         }
    });
}

function addMainIdtfIntoScs(idtf, value, main_idtf) {
    let template = idtf + ' => ' + main_idtf + ':\n' + '[' + value + '](* <-lang_ru;; *)' + ';\n' + '[' + value +'](* <-lang_en;; *)' + ';;' + '\n';
    fs.appendFileSync(path + idtf + '.scs', template);  
}

function addJustNrelIntoScs(idtf, value, nrel) {
    SCWeb.core.Server.findIdentifiersSubStr(value, function (data) {
         if(data.main.length != 0){
             window.scHelper.getSystemIdentifier(data.main[0][0]).done(function (element) {
                 let template = idtf + ' => ' + nrel + ':' + element + ';;' + '\n';
		 fs.appendFileSync(path + idtf + '.scs', template); 
             })
         } else{
		let template = idtf + ' => ' + nrel + ':\n' + '[' + value + '](* <-lang_ru;; *)' + ';\n' + '[' + value +'](* <-lang_en;; *)' + ';;' + '\n';
		 fs.appendFileSync(path + idtf + '.scs', template); 
         }
	
    }); 
}

function addWithQuantityIntoScs(idtf, value, nrel) {
    let quantityPath = '/home/exhale/ostisihs/kb/quantites.scs'
    let template = idtf + ' => ' + nrel + ':' + value + ';;' + '\n';
    let quantityTemplate = '\n' + value + ' <- quantity;;'
    let readFileContent = fs.readFileSync(quantityPath, "utf8")

    if(readFileContent.indexOf(quantityTemplate) === -1){
        fs.appendFileSync(quantityPath, quantityTemplate);
    }

    fs.appendFileSync(path + idtf + '.scs', template);  
}

function addWithYearScs(idtf, value, nrel) {
    let quantityPath = '/home/exhale/ostisihs/kb/quantites.scs'
    let template = idtf + ' => ' + nrel + ':' + value + ';;' + '\n';
    let yearTemplate = '\n' + value + ' <- year;;'
    let readFileContent = fs.readFileSync(quantityPath, "utf8")

    if(readFileContent.indexOf(yearTemplate) === -1){
        fs.appendFileSync(quantityPath, yearTemplate);
    }

    fs.appendFileSync(path + idtf + '.scs', template);
}


/* --- src/theatre_adding-component.js --- */
/**

 * Cpu Adding component.
 */

cpu_adding.DrawComponent = {
    ext_lang: 'theatre_adding',
    formats: ['format_theatre_adding_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new cpu_adding.DrawWindow(sandbox);
    }
};

cpu_adding.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new cpu_adding.PaintPanel(this.sandbox.container);
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
SCWeb.core.ComponentManager.appendComponentInitialize(cpu_adding.DrawComponent);


