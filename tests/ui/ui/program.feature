Feature: Command Line Program

  Scenario: qissues --help
    Given I launch "bin/qissues" with "--help"
     Then the output should equal:
     """

       Usage: qissues [options]

       Options:

         -h, --help     output usage information
         -V, --version  output the version number
         --clear-cache  Clears the cache
         --init         Setup qissues for the first time
         -v --verbose   Verbosity (increase verbosity with more vs)


     """
