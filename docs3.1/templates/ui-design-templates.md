# UI設計テンプレート

**バージョン**: 3.1.0  
**作成日**: 2025-07-08  
**理論分類**: テンプレート層  
**文書種別**: UI設計・画面仕様・ナビゲーションテンプレート  
**改善レベル**: 実証実験問題根本解決版  

## 1. UI設計テンプレート概要

### 1.1 テンプレート定義
UI設計テンプレートは、プロセスエンジニアリング理論ver3.1における**UI設計の標準化と品質向上を実現し、実証実験で発見されたUI設計品質問題を根本解決**する包括的設計テンプレート集である。

### 1.2 実証実験で発見されたUI設計品質問題
```yaml
ui_design_quality_problems:
  inconsistent_design_standards:
    problem: "UI設計標準の不統一"
    manifestation: "画面間でのデザインパターン不一致"
    root_cause: "統一的な設計テンプレート不在"
    impact: "ユーザビリティ低下・開発効率低下"
    
  insufficient_component_specification:
    problem: "コンポーネント仕様不足"
    manifestation: "実装時の推測・解釈違い"
    root_cause: "詳細なコンポーネント仕様テンプレート不足"
    impact: "実装品質低下・手戻り作業増加"
    
  inadequate_interaction_design:
    problem: "インタラクション設計不備"
    manifestation: "ユーザー操作フローの不明確性"
    root_cause: "インタラクション設計テンプレート不足"
    impact: "UX品質低下・テスト困難"
    
  missing_accessibility_consideration:
    problem: "アクセシビリティ考慮不足"
    manifestation: "アクセシビリティ要件の見落とし"
    root_cause: "アクセシビリティテンプレート不在"
    impact: "利用者制限・法的リスク"
```

## 2. 画面設計テンプレート

### 2.1 基本画面設計テンプレート
```yaml
basic_screen_design_template:
  metadata_section:
    screen_id: "[画面ID]"
    screen_name: "[画面名]"
    screen_type: "[page/modal/drawer/overlay]"
    url_pattern: "[URLパターン]"
    access_level: "[public/authenticated/admin]"
    
  layout_section:
    layout_type: "[basic/sidebar/dashboard/fullscreen]"
    header_configuration:
      show_header: boolean
      header_type: "[main/sub/custom]"
      navigation_items: string[]
      
    sidebar_configuration:
      show_sidebar: boolean
      sidebar_type: "[navigation/filter/info]"
      sidebar_items: string[]
      
    content_area:
      content_type: "[form/list/detail/dashboard]"
      scroll_behavior: "[auto/hidden/scroll]"
      responsive_behavior: object
      
    footer_configuration:
      show_footer: boolean
      footer_type: "[main/minimal/none]"
      footer_items: string[]
      
  responsive_design:
    breakpoints:
      mobile: "375px"
      tablet: "768px"
      desktop: "1200px"
      
    layout_adjustments:
      mobile: object
      tablet: object
      desktop: object
```

### 2.2 フォーム画面設計テンプレート
```yaml
form_screen_design_template:
  form_metadata:
    form_id: "[フォームID]"
    form_purpose: "[create/edit/search/filter]"
    form_complexity: "[simple/medium/complex]"
    validation_strategy: "[client/server/hybrid]"
    
  form_structure:
    form_sections:
      - section_id: "[セクションID]"
        section_title: "[セクションタイトル]"
        section_description: "[セクション説明]"
        collapsible: boolean
        required: boolean
        
    field_groups:
      - group_id: "[グループID]"
        group_title: "[グループタイトル]"
        group_layout: "[horizontal/vertical/grid]"
        fields: object[]
        
  field_specifications:
    - field_id: "[フィールドID]"
      field_name: "[フィールド名]"
      field_type: "[text/email/password/select/checkbox/radio/textarea/file]"
      field_label: "[フィールドラベル]"
      placeholder: "[プレースホルダー]"
      help_text: "[ヘルプテキスト]"
      required: boolean
      validation_rules: object[]
      error_messages: object
      
  form_actions:
    primary_actions:
      - action_id: "[アクションID]"
        action_label: "[アクションラベル]"
        action_type: "[submit/save/next]"
        button_style: "[primary/secondary/danger]"
        disabled_conditions: string[]
        
    secondary_actions:
      - action_id: "[アクションID]"
        action_label: "[アクションラベル]"
        action_type: "[cancel/reset/back]"
        button_style: "[secondary/text/link]"
        
  validation_design:
    real_time_validation: boolean
    validation_timing: "[onBlur/onChange/onSubmit]"
    error_display_strategy: "[inline/summary/toast]"
    success_feedback: "[inline/toast/redirect]"
```

### 2.3 リスト画面設計テンプレート
```yaml
list_screen_design_template:
  list_metadata:
    list_id: "[リストID]"
    list_purpose: "[display/selection/management]"
    data_source: "[api/static/computed]"
    pagination_strategy: "[page/infinite/virtual]"
    
  list_structure:
    header_section:
      show_title: boolean
      title_text: "[タイトル]"
      show_count: boolean
      show_actions: boolean
      bulk_actions: string[]
      
    filter_section:
      show_filters: boolean
      filter_layout: "[horizontal/vertical/sidebar]"
      quick_filters: object[]
      advanced_filters: object[]
      
    search_section:
      show_search: boolean
      search_type: "[simple/advanced]"
      search_fields: string[]
      search_suggestions: boolean
      
  item_design:
    item_layout: "[card/row/grid/tile]"
    item_fields:
      - field_id: "[フィールドID]"
        field_label: "[フィールドラベル]"
        field_type: "[text/image/badge/link/button]"
        display_priority: number
        responsive_behavior: object
        
    item_actions:
      - action_id: "[アクションID]"
        action_label: "[アクションラベル]"
        action_type: "[view/edit/delete/custom]"
        action_style: "[button/link/icon]"
        permission_required: string
        
  pagination_design:
    pagination_type: "[numbered/simple/infinite]"
    items_per_page: number
    page_size_options: number[]
    show_total_count: boolean
    
  empty_state_design:
    empty_message: "[空状態メッセージ]"
    empty_illustration: "[イラストレーション]"
    empty_actions: object[]
```

## 3. コンポーネント設計テンプレート

### 3.1 基本コンポーネントテンプレート
```yaml
basic_component_template:
  component_metadata:
    component_id: "[コンポーネントID]"
    component_name: "[コンポーネント名]"
    component_category: "[form/display/navigation/feedback]"
    component_complexity: "[atomic/molecular/organism]"
    reusability_level: "[project/domain/universal]"
    
  component_interface:
    props_definition:
      - prop_name: "[プロパティ名]"
        prop_type: "[TypeScript型]"
        prop_required: boolean
        prop_default: "[デフォルト値]"
        prop_description: "[説明]"
        
    state_definition:
      - state_name: "[状態名]"
        state_type: "[TypeScript型]"
        state_initial: "[初期値]"
        state_purpose: "[目的]"
        
    events_definition:
      - event_name: "[イベント名]"
        event_type: "[TypeScript型]"
        event_trigger: "[トリガー条件]"
        event_payload: "[ペイロード型]"
        
  component_behavior:
    lifecycle_hooks:
      - hook_name: "[フック名]"
        hook_purpose: "[目的]"
        hook_timing: "[実行タイミング]"
        
    side_effects:
      - effect_name: "[副作用名]"
        effect_trigger: "[トリガー]"
        effect_description: "[説明]"
        
  component_styling:
    css_classes:
      - class_name: "[クラス名]"
        class_purpose: "[目的]"
        class_properties: object
        
    responsive_behavior:
      mobile: object
      tablet: object
      desktop: object
      
  accessibility_requirements:
    aria_attributes: object[]
    keyboard_navigation: object
    screen_reader_support: object
    color_contrast: object
```

### 3.2 フォームコンポーネントテンプレート
```yaml
form_component_template:
  form_component_metadata:
    component_type: "[input/select/checkbox/radio/textarea]"
    validation_support: boolean
    error_handling: boolean
    accessibility_level: "[basic/enhanced/full]"
    
  input_specifications:
    input_types: string[]
    input_formats: object[]
    input_constraints: object
    input_transformations: object[]
    
  validation_specifications:
    validation_rules:
      - rule_name: "[ルール名]"
        rule_type: "[required/pattern/range/custom]"
        rule_parameters: object
        error_message: "[エラーメッセージ]"
        
    validation_timing: "[real-time/on-blur/on-submit]"
    validation_display: "[inline/tooltip/summary]"
    
  error_handling:
    error_states: string[]
    error_messages: object
    error_recovery: object[]
    
  accessibility_features:
    label_association: object
    error_announcement: object
    keyboard_support: object
    focus_management: object
```

## 4. ナビゲーション設計テンプレート

### 4.1 メインナビゲーションテンプレート
```yaml
main_navigation_template:
  navigation_metadata:
    navigation_id: "[ナビゲーションID]"
    navigation_type: "[header/sidebar/breadcrumb/pagination]"
    navigation_level: "[primary/secondary/tertiary]"
    responsive_behavior: "[collapse/hide/transform]"
    
  navigation_structure:
    navigation_items:
      - item_id: "[アイテムID]"
        item_label: "[アイテムラベル]"
        item_url: "[URL]"
        item_icon: "[アイコン]"
        item_badge: "[バッジ]"
        access_level: "[権限レベル]"
        children: object[]
        
  navigation_behavior:
    active_state_logic: "[exact/partial/custom]"
    hover_behavior: object
    click_behavior: object
    keyboard_navigation: object
    
  responsive_design:
    mobile_behavior: "[hamburger/tabs/drawer]"
    tablet_behavior: object
    desktop_behavior: object
    
  accessibility_features:
    aria_navigation: object
    skip_links: object[]
    focus_indicators: object
```

### 4.2 ブレッドクラムテンプレート
```yaml
breadcrumb_template:
  breadcrumb_metadata:
    breadcrumb_id: "[ブレッドクラムID]"
    auto_generation: boolean
    max_levels: number
    truncation_strategy: "[middle/end/smart]"
    
  breadcrumb_structure:
    breadcrumb_items:
      - level: number
        label: "[ラベル]"
        url: "[URL]"
        clickable: boolean
        
  breadcrumb_behavior:
    separator_style: "[arrow/slash/dot]"
    current_page_style: "[text/disabled-link]"
    overflow_handling: "[truncate/scroll/dropdown]"
    
  responsive_design:
    mobile_display: "[hide/truncate/scroll]"
    tablet_display: object
    desktop_display: object
```

## 5. インタラクション設計テンプレート

### 5.1 基本インタラクションテンプレート
```yaml
basic_interaction_template:
  interaction_metadata:
    interaction_id: "[インタラクションID]"
    interaction_type: "[click/hover/focus/drag/swipe]"
    interaction_target: "[element/area/screen]"
    interaction_complexity: "[simple/medium/complex]"
    
  interaction_flow:
    trigger_conditions: string[]
    pre_conditions: string[]
    interaction_steps:
      - step_number: number
        step_description: "[ステップ説明]"
        user_action: "[ユーザーアクション]"
        system_response: "[システム応答]"
        visual_feedback: "[視覚的フィードバック]"
        
    post_conditions: string[]
    error_conditions: string[]
    
  feedback_design:
    immediate_feedback: object
    progress_feedback: object
    completion_feedback: object
    error_feedback: object
    
  animation_specifications:
    animation_type: "[fade/slide/scale/rotate]"
    animation_duration: "[ms]"
    animation_easing: "[ease/linear/ease-in/ease-out]"
    animation_trigger: "[immediate/delayed/conditional]"
```

### 5.2 フォームインタラクションテンプレート
```yaml
form_interaction_template:
  form_interaction_metadata:
    form_id: "[フォームID]"
    interaction_strategy: "[progressive/all-at-once/wizard]"
    validation_strategy: "[real-time/on-submit/hybrid]"
    
  field_interactions:
    - field_id: "[フィールドID]"
      focus_behavior: object
      input_behavior: object
      validation_behavior: object
      error_behavior: object
      
  form_flow:
    entry_flow: object[]
    validation_flow: object[]
    submission_flow: object[]
    error_recovery_flow: object[]
    
  user_assistance:
    help_system: object
    auto_completion: object
    smart_defaults: object
    progress_indication: object
```

## 6. アクセシビリティテンプレート

### 6.1 基本アクセシビリティテンプレート
```yaml
basic_accessibility_template:
  accessibility_metadata:
    wcag_level: "[A/AA/AAA]"
    target_disabilities: string[]
    assistive_technologies: string[]
    
  semantic_structure:
    heading_hierarchy: object
    landmark_roles: object[]
    content_structure: object
    
  keyboard_accessibility:
    tab_order: object[]
    keyboard_shortcuts: object[]
    focus_management: object
    skip_links: object[]
    
  screen_reader_support:
    aria_labels: object[]
    aria_descriptions: object[]
    live_regions: object[]
    role_definitions: object[]
    
  visual_accessibility:
    color_contrast: object
    text_sizing: object
    focus_indicators: object
    motion_preferences: object
```

### 6.2 フォームアクセシビリティテンプレート
```yaml
form_accessibility_template:
  form_accessibility_metadata:
    form_complexity: "[simple/medium/complex]"
    error_handling_strategy: "[inline/summary/both]"
    
  label_association:
    explicit_labels: object[]
    implicit_labels: object[]
    aria_labelledby: object[]
    aria_describedby: object[]
    
  error_accessibility:
    error_identification: object
    error_description: object
    error_correction: object
    error_prevention: object
    
  input_assistance:
    input_purpose: object[]
    autocomplete_attributes: object[]
    input_format_help: object[]
    required_field_indication: object
```

---

**UI設計テンプレート設計者**: プロセスエンジニアリングシステム ver3.1  
**設計保証レベル**: 最高（標準化・品質向上・アクセシビリティ確保）  
**適用範囲**: 全UI設計・全画面・全コンポーネント  
**効果保証**: 設計品質向上、開発効率化、ユーザビリティ向上  
**更新日**: 2025-07-08
