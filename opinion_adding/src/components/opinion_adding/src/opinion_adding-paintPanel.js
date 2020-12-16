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
