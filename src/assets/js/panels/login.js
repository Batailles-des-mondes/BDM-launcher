/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { database, changePanel, addAccount, accountSelect } from '../utils.js';

class Login {
    static id = "login";
    async init(config, _, AZauth) {
        this.config = config
        this.database = await new database().init();
        this.AZclient = AZauth
        this.getOnline()
    }

    getOnline() {
        console.log(`Initializing microsoft Panel...`)
        console.log(`Initializing mojang Panel...`)
        this.login();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    async login() {
        let login_card = document.querySelector('.login-card-mojang')
        let A2F_card = document.querySelector('.login-AZauth-A2F')
        let A2F_code = document.querySelector('.A2F-AZauth')
        let A2F_connect = document.querySelector('.connect-AZauth-A2F')
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let infoLogin = document.querySelector('.info-login')
        let loginBtn = document.querySelector(".login-btn")

        loginBtn.addEventListener("click", async () => {
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = true;
            infoLogin.innerHTML = "Connexion en cours...";


            if (mailInput.value == "") {
                infoLogin.innerHTML = "Entrez votre adresse email / Nom d'utilisateur"
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (mailInput.value.length < 3) {
                infoLogin.innerHTML = "Votre nom d'utilisateur doit avoir au moins 3 caractères"
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (passwordInput.value == "") {
                infoLogin.innerHTML = "Entrez votre mot de passe"
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            let account_connect = await this.AZclient.login(mailInput.value, passwordInput.value)

            if (account_connect == null || account_connect.error) {
                console.log(err)
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                infoLogin.innerHTML = 'Adresse E-mail ou mot de passe invalide'
                return
            }

            if (account_connect.A2F) {
                login_card.style.display = 'none'
                A2F_card.style.display = 'block'

                A2F_connect.addEventListener('click', async () => {
                    account_connect = await this.AZclient.login(mailInput.value, passwordInput.value, A2F_code.value)

                    let account = {
                        access_token: account_connect.access_token,
                        client_token: account_connect.client_token,
                        uuid: account_connect.uuid,
                        name: account_connect.name,
                        user_properties: account_connect.user_properties,
                        meta: {
                            type: account_connect.meta.type,
                            offline: account_connect.meta.offline
                        }
                    }

                    this.database.add(account, 'accounts')
                    this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                    addAccount(account)
                    accountSelect(account.uuid)
                    changePanel("home");

                    login_card.style.display = 'block'
                    A2F_card.style.display = 'none'
                    mailInput.value = "";
                    A2F_code.value = "";
                    passwordInput.value = "";
                    loginBtn.disabled = false;
                    mailInput.disabled = false;
                    passwordInput.disabled = false;
                    loginBtn.style.display = "block";
                    infoLogin.innerHTML = "&nbsp;";
                })
                return
            }

            let account = {
                access_token: account_connect.access_token,
                client_token: account_connect.client_token,
                uuid: account_connect.uuid,
                name: account_connect.name,
                user_properties: account_connect.user_properties,
                meta: {
                    type: account_connect.meta.type,
                    offline: account_connect.meta.offline
                }
            }

            this.database.add(account, 'accounts')
            this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

            addAccount(account)
            accountSelect(account.uuid)
            changePanel("home");

            login_card.style.display = 'block'
            A2F_card.style.display = 'none'
            mailInput.value = "";
            A2F_code.value = "";
            loginBtn.disabled = false;
            mailInput.disabled = false;
            passwordInput.disabled = false;
            passwordInput.value = "";
            loginBtn.style.display = "block";
            infoLogin.innerHTML = "&nbsp;";
        })
    }
}

export default Login;