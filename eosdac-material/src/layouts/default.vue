<template>
<q-layout view="hHh Lpr lff">
  <q-layout-header class="no-shadow">
    <q-toolbar color="dark2">
      <q-btn size="md" flat dense round class="q-mr-sm" style="margin-top:-4px" @click="leftDrawerOpen = !leftDrawerOpen" :aria-label="$t('default.menu')">
        <q-icon v-if="leftDrawerOpen" name="icon-ui-8" />
        <q-icon v-else name="icon-menu-9" />
      </q-btn>
      <q-toolbar-title class="text-white q-pl-none">
        <img src="statics/img/icon-signet-eosdacmemberclient175x48.svg" style="height:48px;" :title="$t('default.member_client')">
      </q-toolbar-title>
      <div class="xs-hide sm-hide md-hide" >
        <MenuDropdown class="no-pointer-events animate-fade" v-if="getAccountName && getRegistered && getTokenBalance" iconColor="white" :label="$t('default.member_status')" :statusLabel="1" :sublabel="$t('default.registered')" icon="icon-role-3" />
        <MenuDropdown class="no-pointer-events animate-fade" v-if="getAccountName && getRegistered && !getTokenBalance" iconColor="white" :label="$t('default.member_status')" :statusLabel="3" :sublabel="$t('default.pending')" icon="icon-role-2" />
        <MenuDropdown v-close-overlay v-if="getAccountName && !getRegistered" iconColor="white" :label="$t('default.member_status')" :statusLabel="2" :sublabel="$t('default.not_registered')" icon="icon-role-1" :iconRight="true">
          <q-list class="bg-dark2" dark link>
            <q-item to="/constitution" dark>
              <q-item-side>
                <q-item-tile icon="icon-register-3">
                </q-item-tile>
                {{ $t('default.sign_the_constitution') }}
              </q-item-side>
            </q-item>
          </q-list>
        </MenuDropdown>
        <MenuDropdown class="no-pointer-events animate-fade" v-if="getAccountName" iconColor="white" :label="$t('default.your_token_balance', { tokenName: tokenName })" :sublabel="String(getTokenBalance)" icon="icon-dac-balance" />
        <MenuDropdown class="no-pointer-events animate-fade" v-if="getAccountName" iconColor="white" :label="$t('default.your_token_balance', { tokenName: mainCurrencyName })" :sublabel="String(getMainCurrencyBalance)" icon="icon-type-2" />
        <MenuDropdown class="no-pointer-events animate-fade" v-if="getAccountName" iconColor="white" :label="$t('default.account_name')" :sublabel="getAccountName" icon="icon-topmenu-2" />
        <MenuDropdown class="animate-fade" v-if="getAccountName" iconColor="positive" :label="$t('default.status')" :sublabel="$t('default.logged_in')" icon="icon-topmenu-1" :iconRight="true">
          <q-list v-close-overlay class="bg-dark2" dark link>
            <q-item @click.native="lockScatter()" dark>
              <q-item-side>
                <q-item-tile icon="icon-topmenu-4">
                </q-item-tile>
                {{ $t('default.log_out') }}
              </q-item-side>
            </q-item>
            <!-- <q-item @click.native="switchIdentity()" dark>
              <q-item-side>
                <q-item-tile icon="icon-topmenu-4">
                </q-item-tile>
                {{ $t('default.switch_account') }}
              </q-item-side>
            </q-item> -->
          </q-list>
        </MenuDropdown>
        <MenuDropdown v-else iconColor="white" :label="$t('default.status')" :sublabel="$t('default.logged_out')" icon="icon-topmenu-4" :iconRight="true">
          <q-list v-close-overlay class="bg-dark2" dark link>
            <q-item @click.native="unlockAccount()" dark>
              <q-item-side>
                <q-item-tile color="positive" icon="icon-topmenu-1">
                </q-item-tile>
                {{ $t('default.log_in') }}
              </q-item-side>
            </q-item>
          </q-list>
        </MenuDropdown>
      </div>
    </q-toolbar>
  </q-layout-header>
  <q-layout-drawer v-model="leftDrawerOpen" content-class="bg-dark2">
    <!-- login button -->
    <q-list v-if="!getAccountName" no-border link inset-delimiter dark>
      <q-item @click.native="unlockAccount()">
        <q-item-side>
          <q-item-tile color="positive" icon="icon-topmenu-1" />
        </q-item-side>
        <q-item-main :label="$t('default.log_in')" sublabel="" />
      </q-item>
    </q-list>
    <q-list no-border link inset-delimiter dark>
      <q-item class="lg-hide xl-hide" @click.native="lockScatter()">
        <q-item-side>
          <q-item-tile color="negative" icon="icon-topmenu-4" />
        </q-item-side>
        <q-item-main :label="$t('default.log_out')" sublabel="" />
      </q-item>

      <q-item v-if="getRegistered" class="lg-hide xl-hide">
        <q-item-side>
          <q-item-tile color="white" icon="icon-dac-balance" />
        </q-item-side>
        <q-item-main class="text-positive" :sublabel="$t('default.member_status')">
          <b>{{ $t('default.registered') }}</b>
        </q-item-main>
      </q-item>
      <q-item v-else class="lg-hide xl-hide">
        <q-item-side>
          <q-item-tile color="white" icon="icon-dac-balance" />
        </q-item-side>
        <q-item-main class="text-negative" :sublabel="$t('default.member_status')">
          <b>{{ $t('default.not_registered') }}</b>
        </q-item-main>
        <q-item-side right>
          <q-item-tile color="white" icon="icon-ui-11" />
        </q-item-side>
        <q-popover v-if="!getRegistered" class="lg-hide xl-hide" fit>
          <q-list class="bg-dark2" dark link>
            <q-item @click.native="alert('sign')" dark>
              <q-item-side>
                <q-item-tile icon="icon-register-3">
                </q-item-tile>
                {{ $t('default.sign_the_constitution') }}
              </q-item-side>
            </q-item>
          </q-list>
        </q-popover>
      </q-item>
      <q-item-separator class="lg-hide xl-hide" />
      <!--<q-item to="/dashboard">
        <q-item-side icon="icon-menu-1" />
        <q-item-main label="Dashboard" sublabel="" />
      </q-item>-->
      <!-- <q-item v-if="getMemberRoles.custodian" class="text-blue" to="/custodiandashboard">
        <q-item-side class="text-blue" icon="icon-role-4" />
        <q-item-main label="Custodian Dashboard" sublabel="" />
      </q-item> -->
      <q-collapsible  v-if="getMemberRoles.custodian && getAccountName" dark icon="icon-role-4" @hide="submenuheader_open = false" @show="submenuheader_open = true" :header-class="{submenuheader: submenuheader_open}"  label="Custodian Tools">
        <div class="bg-dark">
          <q-item class="q-pl-lg" link to="/msigproposals">
            <q-item-side icon="icon-topmenu-6" />
            <q-item-main label="Msig Proposals" sublabel="" />
          </q-item>
        </div>
      </q-collapsible>
      <q-item to="/constitution">
        <q-item-side icon="icon-register-3" />
        <q-item-main :label="$t('default.constitution')" sublabel="" />
        <q-chip  v-if="getRegisteredVersionUpdate" dense small square color="red">{{$t('default.new_version')}}</q-chip>
      </q-item>
      <q-item v-if="getAccountName" :to="'/profile/'+getAccountName">
        <q-item-side icon="icon-menu-10" />
        <q-item-main :label="$t('default.profile')" sublabel="" />
      </q-item>
      <q-item to="/wallet" :disabled="!getAccountName">
        <q-item-side icon="icon-menu-6" />
        <q-item-main :label="$t('default.wallet')" sublabel="" />
      </q-item>
      <q-item to="/votecustodians">
        <q-item-side icon="icon-ui-3" />
        <q-item-main :label="$t('default.custodians')" sublabel="" />
      </q-item>

      <q-item v-if="!getMemberRoles.candidate" to="/managecandidateship" :disabled="!getAccountName">
        <q-item-side icon="icon-menu-12" />
        <q-item-main :label="$t('default.register_as_candidate')" sublabel="" />
      </q-item>
      <q-item v-if="getMemberRoles.candidate" to="/managecandidateship" :disabled="!getAccountName">
        <q-item-side icon="icon-menu-12" />
        <q-item-main :label="$t('default.unregister_as_candidate')" sublabel="" />
      </q-item>

      <q-item @click.native="openURL($configFile.api.tokenExplorerUrl)">
        <q-item-side icon="icon-menu-4" />
        <q-item-main :label="$t('default.token_explorer')" sublabel="" />
        <q-item-side right icon="icon-transfer-out" />
      </q-item>
      <q-item @click.native="openURL($configFile.external.discordUrl)">
        <q-item-side icon="icon-menu-11" />
        <q-item-main :label="$t('default.support')" sublabel="" />
        <q-item-side right icon="icon-transfer-out" />
      </q-item>
      <q-item to="/settings" :disabled="!getAccountName">
        <q-item-side icon="icon-topmenu-6" />
        <q-item-main :label="$t('default.settings')" sublabel="" />
      </q-item>
      <q-item to="/credits">
        <q-item-side icon="stars" />
        <q-item-main :label="$t('default.credits')" sublabel="" />
      </q-item>

      <!-- <q-item to="/workerproposals">
        <q-item-side icon="icon-menu-8" />
        <q-item-main :label="$t('default.worker_proposals')" sublabel="" />
      </q-item> -->



    </q-list>
    
    <div class="absolute-bottom row  bg-dark2 justify-center q-pa-md" style="border-top: 1px solid #272B35;margin-left:-20px" ><VoteEosdac /></div>
  </q-layout-drawer>



  <q-page-container style="overflow:hidden">
    <transition appear enter-active-class="animated fadeInDown">
      <q-alert v-if="!getRegistered && getAccountName && setupComplete" color="blue" appear>
      
        <q-icon flat size="30px" class="float-left q-ma-sm" name="icon-register-3"></q-icon>
        <div class="q-title">{{ $t('default.sign_the_constitution') }}
          <q-icon flat size="40px" class="float-right q-mt-sm cursor-pointer" name="icon-ui-8" @click.native="setupComplete = false"></q-icon>
        </div>
        <span v-if="!getRegisteredVersionUpdate" class="on-left">{{ $t('default.you_have_not_yet_registered') }}</span>
        <span v-else class="on-left">{{ $t('default.constitution_has_been_updated') }}</span>
        <q-btn v-if="$router.currentRoute.path!='/constitution'" class="q-mt-sm" to="/constitution" text-color="blue" color="white">{{ $t('default.sign_the_constitution') }}</q-btn>
    
      </q-alert>
    </transition>
    
    <!-- animated router paths -->
    <!-- <transition-group appear enter-active-class="animated slideInRight" leave-active-class="animated slideOutLeft" mode="out-in" :duration="300">
      <router-view key="mainpages" />
    </transition-group> -->
    <router-view />


    <Notifier :drawer="leftDrawerOpen" />




  </q-page-container>
  <NodeSelector setup v-on:done="$refs.init_interface.auto_scatter()"/>
  <InitInterface ref="init_interface" v-on:done="setupComplete=true"/>
  <!-- depricated multimodal -->
  <!-- <MultiModal ref="Multi" /> -->

  <q-btn v-back-to-top.animate="{offset: 500, duration: 200}" round color="primary" class="fixed-bottom-right animate-pop" style="margin: 0 20px 15px 0;">
    <q-icon name="keyboard_arrow_up" />
  </q-btn>


</q-layout>
</template>

<script>
import {
  openURL
} from 'quasar'
import {
  mapGetters
} from 'vuex'
import {
  Quasar
} from 'quasar'
import InitInterface from 'components/init-interface'
import NodeSelector from 'components/nodeselector'
import Notifier from 'components/notifier'
import MenuDropdown from 'components/menu-dropdown'
import VoteEosdac from 'components/vote-eosdac'

export default {


  name: 'LayoutDefault',
  components: {
    Notifier,
    MenuDropdown,
    VoteEosdac,
    NodeSelector,
    InitInterface
  },
  data() {
    return {
      // leftDrawerOpen: this.$q.platform.is.desktop,
      leftDrawerOpen: this.$router.currentRoute.path=='/' ? false : this.$q.platform.is.desktop,
      tokenName: this.$configFile.network.tokenContract.token,
      mainCurrencyName: this.$configFile.network.mainCurrencyContract.token,
      lastQuery: 0,
      memberStatus: 0,
      setupComplete: false,
      submenuheader_open: false 
    }
  },
  computed: {
    ...mapGetters({
      getImported: 'account/getImported',
      getAccountName: 'account/getAccountName',
      getUsesScatter: 'account/getUsesScatter',
      getRegistered: 'account/getRegistered',
      getScatter: 'api/getScatter',
      getCurrentEndpoint: 'api/getCurrentEndpoint',
      getAutolockInterval: 'account/getAutolockInterval',
      getConnectionInterval: 'api/getConnectionInterval',
      getLastUnlock: 'account/getLastUnlock',
      getUnlocked: 'account/getUnlocked',
      getTokenBalance: 'account/getTokenBalance',
      getAccount: 'account/getAccount',
      getMainCurrencyBalance: 'account/getMainCurrencyBalance',
      getLanguage: 'usersettings/getLanguage',
      getRegisteredVersionUpdate: 'account/getRegisteredVersionUpdate',
      getMemberRoles: 'account/getMemberRoles'
    })
  },
  methods: {
    openURL,
    unlockAccount() {
      this.$refs.init_interface.pairScatter();
    },
    // lockAccount() {
    //   this.$store.commit('account/LOCK_ACCOUNT')
    // },
    async lockScatter() {
      console.log('clicked lockscatter')
      this.getScatter.forgetIdentity();
      this.$store.commit('account/LOCK_ACCOUNT');

    },
    // switchIdentity(){
    //   this.getScatter.forgetIdentity();
    //   location.reload(); 
    // },
    async queryApis() {
      let now = Date.now()
      if (this.getAccountName && this.$q.appVisible) {
        if (now > this.lastQuery + this.getConnectionInterval) {
          this.lastQuery = now;
          this.$store.dispatch('api/getTokenContractBalance');
          this.$store.dispatch('api/getMainCurrencyBalance');
          this.$store.dispatch('api/updateAccountInfo');
        }
      }
    },
    //wip
    // async getActiveCustodians(){
    //   let c = await this.$store.dispatch('api/getCustodians');
    //   // console.log(c)
    // }
    
  },
  mounted() {
    // this.getActiveCustodians();
    // if (!this.getImported) {
    //   this.$refs.Multi.init('register')
    // } else {
    //   if (!this.getUnlocked && this.getScatter) {
    //     this.$refs.Multi.init('signin')
    //   }
    // }
    this.queryApis()
    setInterval(this.queryApis, 1000)
  },
  created() {
    //language detection
    let qLang = (this.getLanguage === 'en-gb') ? 'en-uk' : this.getLanguage
    import ('quasar-framework/i18n/' + qLang).then(lang => {
      if (lang) {
        this.$q.i18n.set(lang.default)
      }
    })
  },
  watch: {
    getAccountName(val) {
      let current_path = this.$router.currentRoute.path;
      console.log(current_path)
      if(!val){
        console.log('logget out')
        this.$router.push({ path: '/' });
        this.leftDrawerOpen = false;
      }
      else{
        this.leftDrawerOpen = this.$q.platform.is.desktop;
      }
    }

  }
}
</script>

<style>
.submenuheader{
  background: #383A3F;
}
.q-collapsible-sub-item{
  padding:0;
  width:100%
}
</style>
