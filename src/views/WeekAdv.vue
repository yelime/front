<template>
<div>
  <div v-if="isScrollUp" class="top-menu">
    <div class="header">
      <div style="display: flex;">
        <img src="@/assets/backarrow.png"/>
        <img src="@/assets/home.png"/>
      </div>
      <div>
        금주의 전단광고
      </div>
      <div><img src="@/assets/hamburgerbar.png"/></div>
    </div>
    <div class="menu">
      <div class="menu-ment">
        금주의 전단 상품을 만나보세요
      </div>
      <div class="menu-list" ref="el" :style="[{cursor: isDragging ? 'grabbing' : 'grab',
        scrollSnapType: isDragging ? '' : '',}]"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp">
        <div class="choose" @click="filterApply(-1)" :style="chooseNum==-1?chooseStyle:noneChooseStyle">
          전체
        </div>
        <div v-for="(n,i) in menu" :key="i" @click="filterApply(i)" :style="chooseNum==`${i}`?chooseStyle:noneChooseStyle">
          {{n}}
        </div>
        <div class="more">
          <img src="@/assets/reversaltriangle.png"/>
        </div>
      </div>
    </div>
  </div>
  <v-row ref="pe" class="products" dense>
    <v-col v-for="(item,i) in product" :key="i" class="product" cols="12" md="4" sm="6" xs="12">
      <img :src="item.img==null?'':`${imgUrl}`+item.img" @error="defaultImg"/>
      <div class="product-info">
        <div>
          <div :style="item.sale==0?noneSaleStyle:saleStyle">{{item.price}}</div>
          <div class="product-sale" v-if="item.sale!=0">{{item.sale}}</div>
        </div>
        <div class="product-name">
          {{item.name}}
        </div>
        <div v-if="item.event!=null" class="product-event">
          {{item.event}}
        </div>
        <div class="product-thumb-comment">
          <div style="display:flex">
            <img src="@/assets/thumb.png"/>{{item.thumb}}
          </div>
          <div v-if="item.comment!=0" style="display:flex">
            <img src="@/assets/comment.png"/>{{item.comment}}
          </div>
        </div>
      </div>
    </v-col>
    <infinite-loading v-if="!isLoding" :identifier="infiniteId" @infinite="onScroll"></infinite-loading>
  </v-row>
  <div v-if="isLoding" class="lds-circle"><div></div></div>  
</div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import axios from 'axios'

export default {
  components: {
    InfiniteLoading,
  },
  name: 'WeekAdv',
  data () {
    return {
      imgUrl:`${this.$imgUrl}`,
      productHeight: 0,
      isLoding: false,
      infiniteId: +new Date(),
      filter : 255,
      page: 0,
      pageLen: 10,
      scrollPos: 0,
      isScrollUp: true,
      isDragging: false,
      cursorPos: [0, 0],
      el: null,
      chooseNum:-1,
      chooseStyle:{
        "color":"black",
        "text-decoration-line": "underline",
        "text-decoration-thickness": "6px",
        "text-decoration-color": "black"
      },
      noneChooseStyle:{
        "color":"gray",
        "text-decoration-line": "none",
      },
      saleStyle:{
        "color":"gray",
        "font-size":"13px",
        "text-decoration-line": "line-through",
        "line-height": "25px",
      },
      noneSaleStyle:{
        "color":"black",
        "text-decoration-line": "none",
      },
      menu:[
          '든든하고 건강하게',
          '여름과일',
          '피코크',
          '신선식품',
          '캠핑에 필수품'
      ],
      product:[
      ]
    }
  },
  mounted() {
    this.loadProduct(-1)
    window.addEventListener("mouseup", this.onMouseUp)
    window.addEventListener('scroll', this.showMenu)
  },
  destroyed() {
    window.removeEventListener("mouseup", this.onMouseUp);
  },
  methods:{
    defaultImg(e){
      e.target.src = require(`@/assets/reversaltriangle.png`)
    },


    showMenu () {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
      
      if (currentScrollPosition < 0) {
        return
      }
      this.isScrollUp = this.scrollPos <currentScrollPosition? false:true
      this.scrollPos = currentScrollPosition
    },

    filterApply(i){
      this.chooseNum=i;
      this.loadProduct(i);
    },


  	onScroll($state){
      this.page++;
      axios.get(`${this.$baseUrl}/${this.filter}/${this.page*this.pageLen}`)
      .then((res)=>{
        setTimeout(() =>{
          if(res.data.length){
            this.product = this.product.concat(res.data);
            $state.loaded()
            if(res.data.length / this.pageLen < 1){
              $state.complete()
            }
          }
          else {
            $state.complete()
          }
        }, 500)
      })
    },

    loadClear(){
      setTimeout(()=>{
        this.isLoding=false
          
      },2000)
    },
    getProduct(){ 
      axios.get(`${this.$baseUrl}/${this.filter}/${this.page*this.pageLen}`)
      .then((res)=>{
        this.product = this.product.concat(res.data);
        if(res.data.length / this.pageLen < 1){
          this.loadClear()
        }
      })
      setTimeout(()=>{
        this.productHeight=this.$refs.pe.clientHeight
        if(this.isLoding){
          this.nextPage()
        }
        this.infiniteId += 1
      },500)
    },
    nextPage(){
      if(this.productHeight<document.documentElement.clientHeight){ 
        this.page++;
        this.getProduct()
      }
      else {
        this.loadClear()
      }
    },
    loadProduct(filters){
      if(!this.isLoding){
        this.isLoding= true
        window.scrollTo(0,0)
        this.page=0
        this.filter =filters==-1?255: Math.pow(2,filters)
        this.infiniteId += 1
        this.product = []
        this.getProduct()
      }

    },




    /** @param {MouseEvent} ev */
    onMouseDown(ev) {
      this.cursorPos = [ev.pageX, ev.pageY];
      this.isDragging = true;
      window.addEventListener("mousemove", this.onMouseHold);
    },
    /** @param {MouseEvent} ev */
    onMouseUp(ev) {
      window.removeEventListener("mousemove", this.onMouseHold);
      this.isDragging = false;
    },
    /** @param {MouseEvent} ev */
    onMouseHold(ev) {
      ev.preventDefault();
      requestAnimationFrame(() => {
        const delta = [
          ev.pageX - this.cursorPos[0],
          ev.pageY - this.cursorPos[1],
        ];
        this.cursorPos = [ev.pageX, ev.pageY];
        if (!this.$refs.el)
          return;
        this.$refs.el.scrollBy({
          left: -delta[0],
          top: -delta[1],
        });
      });
    },


  }
}
</script>

<style>
.top-menu{
  position: fixed;
  background-color: white;
}


.header{
  display: flex;
  width: 100vw;
  justify-content: space-between;
  height: 50px;
  line-height: 30px;
}
.header>div{
  margin:10px;
}
.header>div>img{
  width: 30px;
  height: 30px;
}


.menu-ment{
  margin: 10px;
  text-align: left;
}
.menu{
  box-shadow: 0px 5px 5px -5px gray;
  width: 100vw;
  padding:10px 0 3px 0;
  overflow: hidden;
}
.menu-list{
  color:gray;
  width: 100vw;
  display: flex;
  text-decoration-line: none;
  flex-wrap: nowrap;
  overflow: scroll;
}
.menu-list::-webkit-scrollbar{
    display: none; 
}
.menu-list>div{
  white-space:nowrap;
  padding:0 10px;
  cursor:pointer;
}
.choose{
  color:black;
  text-decoration-line: underline;
  text-decoration-thickness: 6px;
  text-decoration-color: black;
}
.menu-list>div>img{
  width: 10px;
  height: 10px;
}
.more{
  background-color: white;
  opacity: 0.8;
  position: absolute;
  right: 10px;
}


.products{
  padding:130px 10px 10px 10px;
}
.product{
  display:flex;
}
.product>div>div{
  display: flex;
  flex-grow: 1;
}
.product>div{
  display: inline-flex;
  flex-direction: column;
}
.product>img{
  background-color: lightgray;
  border-radius: 15px;
}
.product-name{
  font-size: 0.8em;
}
.product-event{    
  display:inline-flex;
  color:red;
  border:1px solid red;
  border-radius: 5px;
  font-size: 0.2em;
  padding: 0px 5px;
  width: fit-content;
}
.product-info{
  padding: 10px;
}
.product>img{
  width:120px;
  height: 120px;
}
.product-sale{
  padding-left:5px;
}
.product-thumb-comment{
  align-content: space-evenly;
}
.product-thumb-comment>div{
	flex-grow: 1;
  align-items: center;
  font-size: 5px;
  line-height: 27px;
}
.product-thumb-comment>div>img{
  width:20px;
  height: 20px;
}


.lds-circle {
  display: inline-block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 11111111;
  background-color: yellow;
  
  opacity: 0.8;
  transform: translateZ(1px);
}
.lds-circle > div {
  display: inline-block;
  position:fixed;
  top: calc(50% - 100px);
  left:calc(50% - 100px);
  width: 200px;
  height: 200px;
  margin: 8px;
  border-radius: 50%;
  background: #cef;
  animation: lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
@keyframes lds-circle {
  0%, 100% {
    animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
  }
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(1800deg);
    animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1);
  }
  100% {
    transform: rotateY(3600deg);
  }
}
</style>
