// Mock is a method/object that simulates the behavior of a real method/object in controlled ways.
// Mock objects are used in unit testing. Often a method under a test calls other external services or methods within it.
// These are called dependencies. Once mocked, the dependencies behave the way we defined them.
// Mocking is primarily used in unit testing. An object under test may have dependencies on other (complex) objects.
// To isolate the behavior of the object you want to replace the other objects by mocks that simulate the behavior
//      of the real objects. This is useful if the real objects are impractical to incorporate into the unit test.
// In short, mocking is creating objects that simulate the behavior of real objects.

// musime nasimulovat "prubeh' realneho kodu
// kdyz si "jest" sahne do testu a taha potrebne casti kodu, v pripade nastaveni "mocku" jde do slozky "mock" prednostne
// ale dalsi casti kodu potrebuje tak jako tak, proto je zde musime "nasimulovat"
// v pripade "sendgridu" ocekava nacteni APIcka a metodu "send"

module.exports = {
    setApiKey() {

    },
    send() {

    }
};