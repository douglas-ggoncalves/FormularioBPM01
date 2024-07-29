this.workflowCockpit = workflowCockpit({
    init: _init,
    onSubmit: _saveData,
    onError: _rollback
});

function _init(data, info) {
    if (data && data.loadContext) {
        const { initialVariables } = data.loadContext;
        console.log("initialVariables: " + JSON.stringify(initialVariables));
    }
    
    info
        .getUserData()
        .then(function (user) {
            document.querySelector("#nomFun").setAttribute("value", user.fullname);
        })
        .then(function () {
        info.getPlatformData().then(function (platformData) {
            console.log(platformData);
        });
        info.getInfoFromProcessVariables().then(function(data) { 
            console.log(data)          
            let objectsArray = _formatStringToArrayObject(data);

            if(objectsArray.length !== 0) {
                _showViewProps(objectsArray);
            }

            _fillValuesField(data);
            console.log("dataaaaaaa " + JSON.stringify(data))
            _showViewFilesAttachments(data[0].value);
        })
    });
}

async function _saveData(data, info) {

    let newData = {};
    let selectArea = document.querySelector("#areaEmp");
    let selectRegArea = document.querySelector("#regArea");

    // Aba 1
    newData.nomFun = await document.querySelector("#nomFun").value;
    newData.area = await selectArea.options[selectArea.selectedIndex].value;
    newData.dataEntrada = await document.querySelector("#dataEntrada").value;


    // Aba 2
    const dadosProprietarios = [];
    let blocksProp = await document.querySelectorAll('#box-proprietario');

    blocksProp.forEach(async function(block) {
        const nomeProp = await block.querySelector('#nomeProp').value;
        const contatoProp = await block.querySelector('#contatoProp').value;
        const emailProp = await block.querySelector('#emailProp').value;
        
        dadosProprietarios.push({nomeProp, contatoProp, emailProp});
    })

    newData.props = await dadosProprietarios;

    // Aba 3
    newData.regArea = await selectRegArea.options[selectRegArea.selectedIndex].value;
    newData.cepArea = await document.querySelector("#cepArea").value;
    newData.cepEstado = await document.querySelector("#cepEstado").value;
    newData.municipio = await document.querySelector("#municipio").value;
    newData.areaHect = await document.querySelector("#areaHectare").value;
    newData.areaMQ = await document.querySelector("#areaMQ").value;

    // Aba 4
    const anexos = [];
    const blocksAnexos = document.querySelectorAll('#wrap-add-file');

    for (const inputElement of blocksAnexos) {
        const inputBox = inputElement.querySelector('input[name="file"]');
        
        if (inputBox != null && inputBox.files.length > 0) {
            try {
                console.log("inputBox.files[0].name " + inputBox.files[0].name)
                const etapaUmResult = await _etapaUmApiSenior(inputBox.files[0].name);
                await _etapaDoisApiSenior(inputBox.files[0], etapaUmResult.uploadUrl);
                await _etapaTresApiSenior(etapaUmResult.attachment.id);
                await _etapaQuatroApiSenior(etapaUmResult.attachment.id);
                
                anexos.push({ id: etapaUmResult.attachment.id, name: etapaUmResult.attachment.name, uploadDate: etapaUmResult.attachment.uploadDate, addedBy: etapaUmResult.attachment.addedBy });
            } catch (error) {
                console.error("Erro durante o processamento das etapas:", error);
            }
        } else {
            console.log("Input file element not found or no files selected");
        }
    }

    newData.attachmentsInfo = anexos;

 
    console.log(newData);
    return {
      formData: newData,
    };
}

function _rollback(data, info) {
    console.log(data.error);
    if (info.isRequestNew()) {
       return removeData(data.processInstanceId);
    }
    return rollbackData(data.processInstanceId);
}

function _formatStringToArrayObject(data) {
    const regex = /\{[^}]*\}/g;
    const matches  = data[1].value.match(regex);

    const objectsArray = [];

    matches.forEach(match => {
        const cleanMatch = match.slice(1, -1);

        const properties = cleanMatch.split(', ');
        const obj = {};

        properties.forEach(property => {
            const [key, value] = property.split('=');
            obj[key.trim()] = value.trim();
        });

        objectsArray.push(obj);
    });

    return objectsArray;
}

function _showViewProps(props) { 
    $('#box-proprietario').remove();

    props.forEach(function(item) {
        var customHtml = `
        <div id="box-proprietario" class="border rounded mt-3 p-3">
            <div class="d-flex justify-content-end mb-3">
                <button type="button" id="btn-close-tab" class="btn btn-light btn-sm">
                    <img src="./src/img/icons/close_tab.svg" alt="Icone de fechar aba">
                </button>
            </div>
            <div class="row g-2">
                <div class="form-floating">
                    <input type="text" class="form-control" id="nomeProp" placeholder="Preencha o nome do proprietário..." value="${item.nomeProp}" disabled>
                    <label for="floatingInputGrid">Nome do Proprietário *</label>
                </div>
                <div class="col-md">
                    <div class="form-floating">
                      <input type="tel" id="contatoProp" class="form-control propPhone" maxlength="15" placeholder="(00) 00000-0000" value="${item.contatoProp}" disabled>
                      <label for="floatingInputGrid">Contato *</label>
                    </div>
                </div>
                <div class="col-md">
                    <div class="form-floating">
                      <input type="email" class="form-control" id="emailProp" placeholder="abcdefgh@email.com" value="${item.emailProp}" disabled>
                      <label for="floatingInputGrid">E-mail *</label>
                    </div>
                </div>
            </div>
        </div>`;

        $('#box-dados-proprietarios').append(customHtml);
    });
}

function _fillValuesField(data) {
    data.forEach(function(item) {
        switch(item.key) {
            case "areaMQ":
                var areaMQ = document.querySelector("#areaMQ");
                areaMQ.setAttribute('value', item.value)

                break;
            case "areaHect":
                var areaHect = document.querySelector("#areaHectare");
                areaHect.setAttribute('value', item.value)

                break;
            case "municipio":
                var municipio = document.querySelector("#municipio");
                municipio.setAttribute('value', item.value)

                break;
            case "cepEstado":
                var estado = document.querySelector("#cepEstado");
                estado.setAttribute('value', item.value)

                break;
            case "cepArea":
                var cep = document.querySelector("#cepArea");
                cep.setAttribute('value', item.value)

                break;
            case "regArea":
                let selectRegArea = document.querySelector("#regArea");
                selectRegArea.selectedIndex = item.value;
                
                break;
            case "dataEntrada":
                var dataEntrada = document.querySelector("#dataEntrada");
                dataEntrada.setAttribute('value', item.value)

                break;
            case "area":
                let selectArea = document.querySelector("#areaEmp");
                selectArea.selectedIndex = item.value;

                break;
            default:
                break;
        }
    });
}

function _showViewFilesAttachments(files) {
    console.log("_showViewFilesAttachments");
    console.log("filessssssssssssssssss" + JSON.stringify(files));

    const values = files.match(/\[(.*?)\]/)[1];
    const arrayOfString = values.split(',').map(item => item.trim());
    $('#wrap-add-file').remove();

    arrayOfString.forEach(async function(item) {

        let resultApi = await _etapaCincoApiSenior(item);

        const htmlContent = `
                    <div id="wrap-add-file" class="box-add-file">                           
                        <div class="file-label">
                            <button type="button" id="btn-close-tzab-file" class="btn btn-light btn-sm">
                                <img src="./src/img/icons/close_tab.svg" alt="Icone de fechar aba">
                            </button>
                            <div class="file-instructions" style="width: 300px; height: 200px;">
                                <a href="${resultApi.accessUrl}" class="anexo-download">Baixe aqui o anexo</a>
                            </div>  
                        </div>       
                    </div>`;

        $('#container-files').append(htmlContent);
    });
}

function _formatFileToBase64(fileContent) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
    
        reader.readAsDataURL(fileContent);
        reader.onload = function() {
            resolve(reader.result);
        };
        reader.onerror = function(error) {
            reject(error);
        };
    });
}





// Consulta a api da Senior
async function _etapaUmApiSenior(nameFile) {

    try {
        const apiUri = "https://api.senior.com.br/platform/workflow/newAttachment";

        const bodyToSend = {
            name: nameFile
        };
 
        const response = await fetch(apiUri, {
            method: 'POST',
            headers: {
                'client_id': 'a0e4dd22-0ae7-4515-82aa-bec649cb1851',
                'Authorization': 'Bearer KEvz8ZMNdoupPukJZ4EPIoUSqyuhlY9d',
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(bodyToSend)
        });

        if(!response.ok) {
            throw new Error("Erro na requisição.");
        }

        const data = await response.json();
        return data;
    }
    catch(error) {
        console.log("erro na requisição.");
    }             
}

async function _etapaDoisApiSenior(image, uploadUrlContentApi) {
    try {
        if(image) {
            const imageBuffer = await image.arrayBuffer();

            const response = await fetch(uploadUrlContentApi, {
                method: 'PUT',
                headers: {
                    'client_id': 'a0e4dd22-0ae7-4515-82aa-bec649cb1851'
                },
                body: imageBuffer
            });

            if(!response.ok) {
                console.log("Erro na requisição");
                console.log(await response);
            }
        }
    }
    catch(error) {
        console.log("erro na requisição.")
        console.log(error)
    }
}


async function _etapaTresApiSenior(attachmentId) {
    try {
        const apiUri = "https://api.senior.com.br/platform/workflow/actions/commitAttachment";

        const bodyToSend = JSON.stringify({
            id: attachmentId
        });
 
        const response = await fetch(apiUri, {
            method: 'POST',
            headers: {
                'client_id': 'a0e4dd22-0ae7-4515-82aa-bec649cb1851',
                'Authorization': 'Bearer KEvz8ZMNdoupPukJZ4EPIoUSqyuhlY9d',
                'Content-Type': 'application/json'
            }, 
            body: bodyToSend
        });

        if(!response.ok) {
            throw new Error("Erro na requisição.");
        }
    }
    catch(error) {
        console.log("erro na requisição.");
    }             
}


async function _etapaQuatroApiSenior(attachmentId) {

    try {
        const apiUri = "https://api.senior.com.br/platform/workflow/queries/requestAttachmentAccess";

        const bodyToSend = JSON.stringify({
            id: attachmentId
        });
 
        const response = await fetch(apiUri, {
            method: 'POST',
            headers: {
                'client_id': 'a0e4dd22-0ae7-4515-82aa-bec649cb1851',
                'Authorization': 'Bearer KEvz8ZMNdoupPukJZ4EPIoUSqyuhlY9d',
                'Content-Type': 'application/json'
            }, 
            body: bodyToSend
        });

        if(!response.ok) {
            throw new Error("Erro na requisição.");
        }

        // const data = await response.json();
        // console.log(data);

        // return data;
    }
    catch(error) {
        console.log("erro na requisição.");
    }             
}



async function _etapaCincoApiSenior(chaveAnexo) {

    try {
        const apiUri = "https://api.senior.com.br/platform/workflow/queries/requestAttachmentAccess";

        const bodyToSend = JSON.stringify({
            id: chaveAnexo
        });
 
        const response = await fetch(apiUri, {
            method: 'POST',
            headers: {
                'client_id': 'a0e4dd22-0ae7-4515-82aa-bec649cb1851',
                'Authorization': 'Bearer KEvz8ZMNdoupPukJZ4EPIoUSqyuhlY9d',
                'Content-Type': 'application/json'
            }, 
            body: bodyToSend
        });

        if(!response.ok) {
            throw new Error("Erro na requisição.");
        }

        const data = await response.json();
        return data;
    }
    catch(error) {
        console.log("erro na requisição.");
    }             
}