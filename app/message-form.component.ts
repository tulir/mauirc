import {Component} from 'angular2/core'
import {Http, HTTP_PROVIDERS, Headers} from 'angular2/http';
@Component({
  selector: 'message-form',
  templateUrl: 'app/message-form.component.html'
})

export class MessageFormComponent {
  http: Http

  constructor(http: Http) {
    this.http = http
  }

  sendMessage(message){
    let payload = {channel: "#mau", command: "privmsg", message: message}
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post('/send', JSON.stringify(payload), {headers: headers}).subscribe(
      data => console.log(data),
      err => console.log(err)
    );

    console.log(payload)
  }
}
