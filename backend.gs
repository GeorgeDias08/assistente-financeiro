function doPost(e) {
  try {
    var planilha = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var dados = JSON.parse(e.postData.contents);
    var dataAtual = new Date().toLocaleDateString("pt-BR");
    
    // Adiciona os dados na planilha
    planilha.appendRow([
      dados.id, 
      dados.description, 
      dados.amount, 
      dados.type === 'income' ? 'Entrada' : 'Saída',
      dataAtual
    ]);
    
    // Identifica seu e-mail automaticamente e envia a notificação
    var emailDono = Session.getActiveUser().getEmail();
    var assunto = "Nova Transação Cadastrada: " + dados.description;
    var corpoEmail = "Olá!\n\nUma nova transação foi adicionada ao seu assistente financeiro:\n\n" +
                     "Descrição: " + dados.description + "\n" +
                     "Valor: R$ " + dados.amount.toFixed(2) + "\n" +
                     "Tipo: " + (dados.type === 'income' ? 'Entrada' : 'Saída') + "\n" +
                     "Data: " + dataAtual + "\n\n" +
                     "Atenciosamente,\nSeu Assistente Financeiro.";
                     
    MailApp.sendEmail(emailDono, assunto, corpoEmail);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "sucesso"}))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch(erro) {
    return ContentService.createTextOutput(JSON.stringify({"status": "erro", "mensagem": erro.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}