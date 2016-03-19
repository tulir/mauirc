import {bootstrap}    from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {MessagePanelComponent} from './message-panel.component';
import {MessageFormComponent} from './message-form.component';

bootstrap(MessagePanelComponent);
bootstrap(MessageFormComponent, [HTTP_PROVIDERS]);
