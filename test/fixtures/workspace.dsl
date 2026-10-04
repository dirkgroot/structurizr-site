workspace "My Architecture" {
  model {
    user = person "User" "A person who uses the system"
    system = softwareSystem "System" "The software system being described"
    user -> system "Uses"
  }

  views {
    systemLandscape {
      include *
    }

    systemContext system {
      include *
    }
  }
}
