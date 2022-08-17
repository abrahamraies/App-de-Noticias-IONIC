import { Component, Input } from '@angular/core';
import { ActionSheetButton, ActionSheetController, Platform } from '@ionic/angular';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';


import { StorageService } from 'src/app/services/storage.service';

import { Article } from 'src/app/interfaces';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent{

  @Input() article: Article;
  @Input() index: number;


  constructor(
    private iab: InAppBrowser,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private socialSharing: SocialSharing,
    private storageService: StorageService) { }

  openArticle(){
    
    if( this.platform.is('ios') || this.platform.is('android')){
      const browser = this.iab.create(this.article.url);
      browser.show();
      return;
    }
    
    window.open(this.article.url, '_blank');
  }

  async onOpenMenu(){

    const articleInFavorites = this.storageService.articleInFavorites(this.article);

    const normalBtns: ActionSheetButton[] = [
      {
        text: articleInFavorites? 'Remover favorito' : 'Favorito',
        icon: articleInFavorites? 'heart' :'heart-outline',
        handler: () => this.onToggleFavorite()
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel'
      }
    ]

    const shareBtn: ActionSheetButton = {
      text: 'Compartir',
      icon: 'share-outline',
      
      handler: () => this.onShareArticle()
    };
    normalBtns.unshift(shareBtn);
    //if (this.platform.is('capacitor')){
    //  normalBtns.unshift(shareBtn);
    //}

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: normalBtns
    });
    await actionSheet.present();
  }

  onShareArticle(){

    if( this.platform.is('cordova')){
      const { title,source,url } = this.article

    this.socialSharing.share(
      title,
      source.name,
      null,
      url
      );
    }else{
      if (navigator.share) {
        navigator.share({
          title: this.article.title,
          text: this.article.description,
          url: this.article.url,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      }else{
        console.log("Este metodo no esta soportado.")
      }
    }
  }

    
  onToggleFavorite(){
    this.storageService.saveRemoveArticle(this.article);
  }

}
