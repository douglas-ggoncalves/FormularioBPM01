$(document).ready(function () {  
    $('.datepicker').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true,
        language: 'pt-BR',
        orientation: 'auto'
    });  

    $('#box-dados-proprietarios').on('click', '#btn-close-tab', function() {
        $(this).closest('#box-proprietario').remove();
    });

    $('#btn-add-new-line').click(function() {
        var customHtml = `
                <div id="box-proprietario" class="border rounded mt-3 p-3">
                    <div class="d-flex justify-content-end mb-3">
                        <button type="button" id="btn-close-tab" class="btn btn-light btn-sm">
                            <img src="./src/img/icons/close_tab.svg" alt="Icone de fechar aba">
                        </button>
                    </div>
                    <div class="row g-2">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="nomeProp" placeholder="Preencha o nome do proprietário..." required>
                            <label for="floatingInputGrid">Nome do Proprietário *</label>
                        </div>
                        <div class="col-md">
                            <div class="form-floating">
                              <input type="tel" id="contatoProp" class="form-control propPhone" maxlength="15" placeholder="(00) 00000-0000" required>
                              <label for="floatingInputGrid">Contato *</label>
                            </div>
                        </div>
                        <div class="col-md">
                            <div class="form-floating">
                              <input type="email" class="form-control" id="emailProp" placeholder="abcdefgh@email.com" required>
                              <label for="floatingInputGrid">E-mail *</label>
                            </div>
                        </div>
                    </div>
                </div>`;

        $('#box-dados-proprietarios').append(customHtml);
    });

    // Consulta API de CEP
    $("#btn-search-cep").click(function() {
        let inputTextCep = $(".box-search-cep").val();

        fetch(`https://viacep.com.br/ws/${inputTextCep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.uf) {
                $('.box-estado').val(data.uf);
                $('.box-municipio').val(data.localidade);

                $('.box-estado, .box-municipio').prop('disabled', true);
            } else {
                swal ( "Oops" ,  "O CEP informado é inválido. Por favor, insira um CEP válido." ,  "error" )
            }
        })
        .catch(error => {
            swal ( "Oops" ,  "Algo de errado aconteceu" ,  "error" )
        });
    });

    // Format string to contact
    $('#box-dados-proprietarios').on('input', '#contatoProp', function() {
        let value = $(this).val();
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        $(this).val(value);
    });

    // Format string to CEP (ZipCode)
    $('#cepArea').on('input', function() {
        let value = $(this).val();
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        $(this).val(value);
    })
    
    $("#btn-add-new-attachment").on('click', function() {
        let newHtmlContent = `
                    <div id="wrap-add-file" class="box-add-file">                           
                        <div class="file-label">
                            <button type="button" id="btn-close-tab-file" class="btn btn-light btn-sm">
                                <img src="./src/img/icons/close_tab.svg" alt="Icone de fechar aba">
                            </button>
                            <div class="file-instructions">
                                <span class="form-drop-file"> Anexe </span>
                                <span class="form-or">  </span>
                                <input type="file" id="file" class="file-input"  name="file"/>
                            </div>
                            <span class="file-name" style="display: none;"></span>
                        </div>       
                    </div>`;

        $('#container-files').append(newHtmlContent);
        // document.querySelector("#container-files").appendChild(newHtmlContent);

        console.log("foi")
    });

    $('#container-files').on('click', '#btn-close-tab-file', async function() {

        const blocksAnexos = document.querySelectorAll('#wrap-add-file');

        for (const inputElement of blocksAnexos) {
            const inputBox = inputElement.querySelector('input[name="file"]');
            
            let url = "https://youtube.com"
            const htmlContent = `<a href="${url}" class="file-name">${inputBox.files[0].name}</a>`;
    
            $('.file-instructions > div').css('display', 'none');
            $('.file-instructions').append(htmlContent);
        }








    });

    // Consulta a api da Senior
    async function _etapaUmApiSenior() {

        try {
            const apiUri = "https://api.senior.com.br/platform/workflow/newAttachment";

            const bodyToSend = {
                name: "Logomarca_Buriti.png"
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
            console.log(data)
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

                const response = fetch(uploadUrlContentApi, {
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
})
