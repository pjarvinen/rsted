var projectId = ""
var projectName = ""
var userId = '111'
var privateToken = 'someToken'
var fileJSON = {}

var pageSetup = function() {
  // Load fixture projects and subfolder
  cy.visit('http://localhost:5000')
  cy.server()
  cy.fixture('projects.json').then((projects) => {
    projectId = projects[0].id
    cy.route('GET', '*', projects)
    cy.get('input#userId').type(userId)
    cy.get('input#privateToken').type(privateToken)
    cy.contains('Load Projects').click()
    projectName = projects[0].name
  })
  cy.fixture('project-folder.json').then((folder) => {
    cy.route('GET', '*', folder)
    cy.get('li#aPlus-' + projectId + ' a').click()
  })
}

describe('File operations', function() {
  before(pageSetup)
  it('opens a subfolder when it has been clicked', function() {
    cy.fixture('subfolder.json').then((subfolder) => {
      cy.server()
      cy.route('GET', '*', subfolder)
      cy.contains('folder1').click()
      cy.get('a[rel="folder1"]:first').next().find('li')
        .should(($li) => {
          expect($li).to.have.length(3)
        })
    })
  })
  it('opens a file on the editor when the file link has been clicked', function() {
    cy.fixture('file.json').then((file) => {
      cy.server()
      cy.route('GET', '*', file)
      cy.get('a[rel="folder1/testi.txt"]').click()
      cy.get('#markItUp').should((editor) => {
        var text = Cypress.$(editor).val()
        var expected = atob(file.content) // base64 decoding with atob(...)
        expect(text).to.deep.eq(expected)
      })
      cy.get('#plussaGuiProjectName').should('contain', projectName)
      cy.get('#plussaGuiFilePath').should('have.text', 'folder1 / testi.txt')
      fileJSON = file
    })
  })
  it('sends a modified text file to the server', function() {
    var editedText = 'ööääTestingääöö'
    cy.get('#markItUp').should((editor) => {
      Cypress.$(editor).val(editedText)
      cy.server()
      cy.route({
        method: 'PUT',
        url: '*',
        response: {},
        onRequest: (xhr) => {
          var header = xhr['request']['headers']['PRIVATE-TOKEN']
          expect(header).to.deep.eq(privateToken)
          var body = xhr['request']['body']
          expect(body.content).to.deep.eq(btoa(editedText)) // base64 encoding with btoa(...)
        }
      })
      cy.get('#plussaGuiSaveFileBtn').click()
    })
  })
  it('asks for confirmation when deleting a file', function() {
    cy.contains('Delete File').click()
    cy.get('#plussaGuiConfirmModal')
      .should('be.visible')
    cy.get('#modalLabel').should('contain', fileJSON.file_path)
    cy.get('#plussaGuiConfirmCancel').click()
    cy.get('#plussaGuiReport').should('contain', 'canceled')
    cy.get('#plussaGuiConfirmCancel').click() // Second click needed in tests because of Bootstrap quirks.
    cy.wait(2000)
    cy.get('#plussaGuiConfirmModal')
      .should('not.be.visible')
  })
  it('updates the file tree after deleting a file', function() {
    cy.server()
    cy.route('DELETE', '*', {})
    cy.contains('Delete File').click()
    cy.get('#plussaGuiConfirmOk').click()
    cy.get('a[rel="folder1/testi.txt"]').should('not.exist')
    cy.get('#markItUp').should((editor) => {
      var empty = Cypress.$(editor).val()
      expect(empty).to.deep.eq('')
    })
    cy.get('#plussaGuiFilePath').should((path) => {
      var empty = Cypress.$(path).text()
      expect(empty).to.deep.eq('')
    })
    cy.get('button.close').click()  // Again, needed in tests because of Bootstrap.
  })
  it('updates the new filename path after file tree clicks', function() {
    cy.get('#markItUp').should((editor) => {
      Cypress.$(editor).val('**Some text**')
    })
    cy.get('#plussaGuiSaveFileBtn').click()
    cy.get('#plussaGuiNewFilePanel').should('have.class', 'show')
    cy.get('a[rel="folder1"]:first').click()
    cy.get('#plussaGuiNewFilePath').should((input) => {
      var path = Cypress.$(input).text()
      expect(path).to.deep.eq('folder1')
    })
  })
  it('validates new folder name after user input', function() {
    Cypress.$('#plussaGuiNewFilePath').text('')
    Cypress.$('#plussaGuiPathInput').val('folder1')
    cy.get('#plussaGuiAddFolderBtn').click()
    cy.get('#plussaGuiReport').should('contain', 'Error') // Folder already exists.
  })
  it('hides Add Folder button after user input', function() {
    // Add folder button should vanish. Only one subfolder addition at a time is allowed.
    cy.get('a[rel="folder1"]:first').click()
    Cypress.$("#plussaGuiPathInput").val('someFolderName')
    cy.get('#plussaGuiAddFolderBtn').click()
    cy.get('#plussaGuiAddFolderBtn').should('not.be.visible')
    cy.get('#plussaGuiNewFilePath').should('have.text', 'folder1 / someFolderName')
  })
  it('hides New File panel after Cancel click', function() {
    // The filepath input field is empty again after subfolder name was accepted.
    cy.get('#plussaGuiPathInput').should('have.text','')
    cy.get('#plussaGuiCancelBtn').click()
    cy.get('#plussaGuiNewFilePanel').should('not.have.class', 'show')
    //cy.wait(2000)
  })

})
