import XCTest
import SwiftTreeSitter
import TreeSitterCmake

final class TreeSitterCmakeTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_cmake())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Cmake grammar")
    }
}
