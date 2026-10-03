class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-darwin-arm64"
      sha256 "0b390d76fd8cb4f519db0dff20309031f18b29a99ce1bef4031e3af4639ce51f"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-darwin-x64"
      sha256 "f7b655282f59450ef840163cb6e12bbc14f335cb2a33d88ead9b5116b1f84450"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-linux-arm64"
      sha256 "bac15c7bcee759df0dacf15b97a5ba693636f646580a1e21656d72b4317d9019"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-linux-x64"
      sha256 "4a458326905f980c819f93f680c9f194301aa1887404dd2f7db2c3e17a0b7da1"
    end
  end

  def install
    bin.install Dir["structurizr-site-*"].first => "structurizr-site"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
