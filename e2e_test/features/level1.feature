Feature: Level 1

  Scenario: Provider 1
    Given I login
    When I visit <provider> console
    Then I see "unknown user" in the <provider> console

    Examples:
      | provider  |
      | provider1 |