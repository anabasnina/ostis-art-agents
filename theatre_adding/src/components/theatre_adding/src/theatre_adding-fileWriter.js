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
