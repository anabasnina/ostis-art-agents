function addTextValueScsTheatre(idtf, value, nrel) {
    let opinionPath = '/home/exhale/ostisihs/kb/teatr/opinions/opinions.scs'
    let template = idtf + ' => ' + nrel + ': [' + value + '];;' + '\n';

    fs.appendFileSync(opinionPath, template);
}
