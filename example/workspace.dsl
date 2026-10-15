workspace "structurizr-site demo" "Walking skeleton demo workspace." {

    model {
        user = person "User"
        softwareSystem = softwareSystem "structurizr-site" "Generates a static site from a Structurizr workspace."
        user -> softwareSystem "Uses"
    }

    views {
        systemContext softwareSystem "SystemContext" {
            include *
            autolayout lr
        }
    }
}
