class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  version "0.1.1"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.1/structurizr-site-darwin-arm64"
      sha256 "f6462f8fbf57c25b410569f5a0c061e42611b2bbe03bddb469da52cb39156076"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.1/structurizr-site-darwin-x64"
      sha256 "9cbaa12c1bfc749e8e33497ad6547e7f18b0db8a97db719f4641a85b453b6bca"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.1/structurizr-site-linux-arm64"
      sha256 "3e559c7900a3e94e0648be866bcc3145da0a928fe9de4c7a93ee4e65178bc0bc"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.1/structurizr-site-linux-x64"
      sha256 "6aa1d51ee40c2d80fe6035b5eee24e11edc86ca6db514215cb5a13f81e3f2355"
    end
  end

  def install
    bin.install Dir["structurizr-site-*"].first => "structurizr-site"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
