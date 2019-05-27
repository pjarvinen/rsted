const projects = [{"id":11862275,
                   "description":"","name":"Testinen"},
                  {"id":10918435,
                   "description":"Test project for TIETS19 / TIEA4 course work at Tampere University",
                   "name":"TuniPlussa"}]
const projectFolder =
  [{"id":"5efe02319ed699783316827b8c8de20d68fe2d8d","name":"folder1","type":"tree","path":"folder1","mode":"040000"},
  {"id":"2575cc4b685a3ee88fc7102d9a333575bc887eed","name":"uusi","type":"tree","path":"uusi","mode":"040000"},
  {"id":"bdacbae9820020bbac67e826a61f3e6d0aa3d9ae","name":"README.md","type":"blob","path":"README.md","mode":"100644"},
  {"id":"23056406b24a227313f115e3e1755074137c6075","name":"joku.txt","type":"blob","path":"joku.txt","mode":"100644"}]

describe('The Main Page', function() {
  it('successfully loads', function() {
    cy.visit('http://localhost:5000')
  })
  it('gives error report when loading projects without user credentials', function() {
    cy.contains('Load Projects')
      .click()
    cy.get('.plussaGuiError')
      .should('contain', 'Error')
  })
  it('prevents file operations before a project is opened', function() {
    cy.contains('Save File')
      .should('have.attr', 'disabled')
    cy.contains('New File')
      .should('have.attr', 'disabled')
    cy.contains('Delete File')
      .should('have.attr', 'disabled')
    cy.contains('HTML Preview')
      .should('have.attr', 'disabled')
    cy.contains('Publish')
      .should('have.attr', 'disabled')
  })

})
