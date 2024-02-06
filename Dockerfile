FROM debian:bookworm

SHELL ["/bin/bash", "--login", "-c"]

# Install base utilities
RUN apt-get update && apt-get install -y \
    curl \
    git \  
    psmisc

# Install Rust
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf -y | sh
SHELL [ "/bin/sh", "-s", ".", "$HOME/.cargo/env" ]
# RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc

# Install Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
RUN export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
RUN nvm install --lts
RUN nvm use --lts

# Install Tarpaulin
# RUN cargo install --path .
RUN cargo install cargo-tarpaulin

# Install Tauri dependencies
RUN apt install -y libwebkit2gtk-4.0-dev \
    build-essential \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Set up work  directory
WORKDIR /notella-docker
COPY . .

# Run bash
CMD ["/bin/bash"]
