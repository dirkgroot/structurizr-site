class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  version "0.2.0-pre-alpha.3"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.3/structurizr-site-darwin-arm64"
      sha256 "c2f4d83414fa556a6c88c2d1bf3442f6a340eef6eec34210013cb8c463c10288"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.3/structurizr-site-darwin-x64"
      sha256 "250b257eb1a5d8f0d34ec0204bfd6dafc8e614cc1ede7a2f8f0ec08627554e6b"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.3/structurizr-site-linux-arm64"
      sha256 "5151c057e78bdaa457f62385161f13b693e92ef17c9dc5ed9a597d9d69f4d51d"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.3/structurizr-site-linux-x64"
      sha256 "da98b856e6cf6b34261893e36976fba5600ae33b56640424e889274f034cfdf3"
    end
  end

  def install
    bin.install Dir["structurizr-site-*"].first => "structurizr-site"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
