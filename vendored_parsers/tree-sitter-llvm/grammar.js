module.exports = grammar({
  name: "llvm",

  conflicts: $ => [
    [$.type_and_value],
    [$.instruction_alloca], [$.instruction_getelementptr], [$._load_store_suffix], [$.instruction_extractvalue],
    [$.instruction_insertvalue], [$.instruction_phi], [$.instruction_cmpxchg], [$.instruction_atomicrmw], [$.instruction_br],
    [$.uwtable],
  ],

  extras: $ => [
    /\s+/,
    $.comment,
  ],

  rules: {
    module: $ => repeat(
      choice(
        // Parse functions from LLParser::parseTargetDefinitions
        $.target_definition,
        $.source_file_name,

        // Parse functions from LLParser::parseTopLevelEntities
        $.declare,
        $.define,
        $.module_asm,
        $.global_type,
        $.global_global,
        $.alias,
        $.ifunc,
        $.comdat,
        $.global_metadata,
        $.summary_entry,
        $.unnamed_attr_grp,
        $.use_list_order,
        $.use_list_order_bb,
      ),
    ),

    comment: $ => /;.*/,

    attr_ref: $ => /#[0-9]+/,
    comdat_ref: $ => token(seq('$', token.immediate(choice(
      /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,

      /\d+/,
      /"[^"]*"/,
    )))),
    global_var: $ => token(seq('@', token.immediate(choice(
      /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,
      /\d+/,
      /"[^"]*"/,
    )))),
    local_var: $ => token(seq('%', token.immediate(choice(
      /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,
      /\d+/,
      /"[^"]*"/,
    )))),
    label: $ => token(seq(choice(
      /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,
      /\d+/,
      /"[^"]*"/,
    ), token.immediate(':'))),

    metadata_ref: $ => token(seq('!', token.immediate(choice(
      /[-a-zA-Z$._\\][-a-zA-Z$._0-9\\]*/,
      /\d+/,
      /"[^"]*"/,
    )))),
    metadata_name: $ => token(seq('!', token.immediate(choice(
      /[-a-zA-Z$._\\][-a-zA-Z$._0-9\\]*/,
      /\d+/,
      /"[^"]*"/,
    )))),
    summary_ref: $ => token(seq('^', token.immediate(choice(
      /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,
      /\d+/,
      /"[^"]*"/,
    )))),

    string: $ => /"[^"]*"/,
    number: $ => choice(/[+-]?\d+/, /[su]?0x[KMLHR]?[0-9a-fA-F]+/), // matches int and float hex literals
    float: $ => /[+-]?\d+\.\d*([Ee][+-]?\d+)?/,

    cstring: $ => /c"[^"]*"/,

    var: $ => choice($.local_var, $.global_var),

    target_definition: $ => seq(
      'target',
      choice(
        $.target_triple,
        $.data_layout,
      ),
    ),

    target_triple: $ => seq(
      'triple',
      '=',
      $.string,
    ),

    data_layout: $ => seq(
      'datalayout',
      '=',
      $.string,
    ),

    source_file_name: $ => seq(
      'source_filename',
      '=',
      $.string,
    ),

    declare: $ => seq(
      'declare',
      repeat($.metadata_attachment),
      $.function_header,
    ),

    define: $ => seq(
      'define',
      $.function_header,
      repeat($.metadata_attachment),
      field('body', $.function_body),
    ),

    metadata_attachment: $ => seq(
      $.metadata_name,
      $.metadata,
    ),

    function_header: $ => seq(
      repeat($.linkage),
      optional($.calling_conv),
      repeat($.param_or_return_attrs),
      optional($.unnamed_addr),
      $.type,
      field('name', $.global_var),
      field('arguments', $.argument_list),
      optional($.unnamed_addr),
      optional($.addrspace),
      repeat($.attribute),
    ),

    linkage: $ => choice(
      $.linkage_aux,
      $.dso_local,
      $.visibility,
      $.dll_storage_class,
      'no_cfi',
    ),

    linkage_aux: $ => choice(
      'private',
      'internal',
      'weak',
      'weak_odr',
      'linkonce',
      'linkonce_odr',
      'available_externally',
      'appending',
      'common',
      'extern_weak',
      'external',
    ),

    dso_local: $ => choice(
      'dso_local',
      'dso_local_equivalent',
      'dso_preemptable',
    ),

    visibility: $ => choice(
      'default',
      'hidden',
      'protected',
    ),

    dll_storage_class: $ => choice(
      'dllimport',
      'dllexport',
    ),

    calling_conv: $ => choice(
      'ccc',
      'fastcc',
      'coldcc',
      'webkit_jscc',
      'anyregcc',
      'preserve_mostcc',
      'preserve_allcc',
      'cxx_fast_tlscc',
      'tailcc',
      'swiftcc',
      'swifttailcc',
      'cfguard_checkcc',
      /x86_[a-z_0-9]+/,
      /arm_[a-z_0-9]+/,
      /aarch64_[a-z_0-9]+/,
      /msp430_[a-z_0-9]+/,
      /avr_[a-z_0-9]+/,
      /ptx_[a-z_0-9]+/,
      /spir_[a-z_0-9]+/,
      /intel_[a-z_0-9]+/,
      /win[a-z_0-9]+/,
      /webkit_[a-z_0-9]+/,
      'ghccc',
      /swift[a-z_0-9]+/,
      /hhvm[a-z_0-9]+/,
      /cxx_[a-z_0-9]+/,
      /amdgpu_[a-z_0-9]+/,
      seq('cc', $.number),
      $.string,
    ),

    unnamed_addr: $ => choice(
      'unnamed_addr',
      'local_unnamed_addr',
    ),

    type: $ => seq(
      choice(
        $.type_keyword,
        $.struct_type,
        $.packed_struct_type,
        $.array_type,
        $.vector_type,
        $.local_var,
      ),
      repeat(seq(
        repeat(seq(
          optional($.addrspace),
          '*',
        )),
        $.argument_list, // function
      )),
      repeat(seq(
        optional($.addrspace),
        '*',
      )),
      optional($.addrspace), // opaque pointer
    ),

    type_keyword: $ => choice(
      'void',
      'half',
      'bfloat',
      'float',
      'double',
      'x86_fp80',
      'fp128',
      'ppc_fp128',
      'label',
      'metadata',
      'x86_mmx',
      'x86_amx',
      'token',
      'opaque',
      'ptr',
      /i\d+/,
    ),

    struct_type: $ => seq('{', optional($.struct_body), '}'),
    packed_struct_type: $ => seq('<{', optional($.struct_body), '}>'),
    array_type: $ => seq('[', $.array_vector_body, ']'),
    vector_type: $ => seq('<', $.array_vector_body, '>'),

    struct_body: $ => commaSep1($.type),

    array_vector_body: $ => seq(
      optional(seq('vscale', 'x')),
      $.number,
      'x',
      $.type,
    ),

    addrspace: $ => seq(
      'addrspace',
      '(',
      $.number,
      ')',
    ),

    argument_list: $ => seq(
      '(',
      commaSep($.argument),
      ')',
    ),

    argument: $ => choice(
      prec(1, seq(
        'metadata',
        repeat($.param_or_return_attrs),
        optional($.metadata),
      )),
      seq(
        $.type,
        repeat($.param_or_return_attrs),
        optional($.value),
      ),
      '...',
    ),

    param_or_return_attrs: $ => choice(
      prec(1, seq('align', $.number)),
      seq(
        $.attribute_name,
        optional(seq('(', choice($.type, $.number), ')')),
      ),
    ),

    attribute: $ => choice(
      seq(
        choice($.attribute_name, $.string, $.attr_ref),
        optional(choice(
          seq('(', commaSep(choice($.type, $.number)), ')'),
          seq('=', choice($.string, $.number)),
        )),
      ),
      seq('section', $.string),
      seq('partition', $.string),
      seq('comdat', optional(seq('(', $.comdat_ref, ')'))),
      $.alignment,
      seq('gc', $.string),
      seq('prefix', $.type_and_value),
      seq('prologue', $.type_and_value),
      seq('personality', $.type_and_value),
    ),

    // Extracted from the LLVM Language Reference
    attribute_name: $ => choice(
      'alignstack',
      'allocsize',
      'alwaysinline',
      'builtin',
      'cold',
      'convergent',
      'disable_sanitizer_instrumentation',
      'hot',
      'inaccessiblememonly',
      'inaccessiblemem_or_argmemonly',
      'inlinehint',
      'jumptable',
      'minsize',
      'naked',
      'no-jump-tables',
      'nobuiltin',
      'noduplicate',
      'nofree',
      'noimplicitfloat',
      'noinline',
      'nomerge',
      'nonlazybind',
      'noprofile',
      'noredzone',
      'indirect-tls-seg-refs',
      'noreturn',
      'norecurse',
      'willreturn',
      'nosync',
      'nounwind',
      'nocallback',
      'nosanitize_coverage',
      'null_pointer_is_valid',
      'optforfuzzing',
      'optnone',
      'optsize',
      'readnone',
      'readonly',
      'writeonly',
      'argmemonly',
      'returns_twice',
      'safestack',
      'sanitize_address',
      'sanitize_memory',
      'sanitize_thread',
      'sanitize_hwaddress',
      'sanitize_memtag',
      'speculative_load_hardening',
      'speculatable',
      'ssp',
      'sspstrong',
      'sspreq',
      'strictfp',
      'nocf_check',
      'shadowcallstack',
      'mustprogress',
      'vscale_range',
      'preallocated',
      'zeroext',
      'signext',
      'inreg',
      'byval',
      'byref',
      'inalloca',
      'sret',
      'elementtype',
      'align',
      'noalias',
      'nocapture',
      'nest',
      'returned',
      'nonnull',
      'dereferenceable',
      'dereferenceable_or_null',
      'swiftself',
      'swiftasync',
      'swifterror',
      'immarg',
      'noundef',
      $.uwtable,
      $.memory_attribute,
    ),

    uwtable: _ => seq('uwtable', optional(seq(
      '(',
      choice('sync', 'async'),
      ')',
    ))),

    memory_attribute: $ => seq(
      'memory',
      '(',
      commaSep1(choice(
        $.memory_attribute_val,
        seq(choice('argmem', 'inaccessiblemem'), ':', $.memory_attribute_val)
      )),
      ')',
    ),

    memory_attribute_val: _ => choice(
      'none',
      'read',
      'write',
      'readwrite',
    ),

    function_body: $ => seq(
      '{',
      repeat(choice($.label, $.instruction)),
      repeat($.use_list_order),
      '}',
    ),

    instruction: $ => seq(
      optional(seq($.local_var, '=')),
      $._instruction_body,
      repeat($.metadata_refs),
    ),

    // Cases from LLParser::parseInstruction
    _instruction_body: $ => choice(
      $.instruction_unreachable,
      $.instruction_ret,
      $.instruction_br,
      $.instruction_resume,
      $.instruction_freeze,
      $.instruction_indirectbr,
      $.instruction_extractelement,
      $.instruction_insertelement,
      $.instruction_select,
      $.instruction_shufflevector,
      $.instruction_fneg,
      $.instruction_bin_op,
      $.instruction_switch,
      $.instruction_invoke,
      $.instruction_cleanupret,
      $.instruction_catchret,
      $.instruction_catchswitch,
      $.instruction_catchpad,
      $.instruction_cleanuppad,
      $.instruction_callbr,
      $.instruction_icmp,
      $.instruction_fcmp,
      $.instruction_cast,
      $.instruction_va_arg,
      $.instruction_phi,
      $.instruction_landingpad,
      $.instruction_call,
      $.instruction_alloca,
      $.instruction_load,
      $.instruction_store,
      $.instruction_cmpxchg,
      $.instruction_atomicrmw,
      $.instruction_fence,
      $.instruction_getelementptr,
      $.instruction_extractvalue,
      $.instruction_insertvalue,
    ),

    instruction_unreachable: $ => field('inst_name', 'unreachable'),

    instruction_ret: $ => seq(field('inst_name', 'ret'), $.type_and_value),
    instruction_br: $ => seq(field('inst_name', 'br'), $.type_and_value,
      optional(seq(',', $.type_and_value, ',', $.type_and_value))),
    instruction_resume: $ => seq(field('inst_name', 'resume'), $.type_and_value),
    instruction_freeze: $ => seq(field('inst_name', 'freeze'), $.type_and_value),

    instruction_indirectbr: $ => seq(field('inst_name', 'indirectbr'), $.type_and_value, ',', $._value_array),

    instruction_extractelement: $ => seq(field('inst_name', 'extractelement'), $.type_and_value, ',', $.type_and_value),

    instruction_insertelement: $ => seq(field('inst_name', 'insertelement'),
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value),
    instruction_select: $ => seq(field('inst_name', 'select'), repeat($.fast_math),
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value),
    instruction_shufflevector: $ => seq(field('inst_name', 'shufflevector'),
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value),

    instruction_fneg: $ => seq(field('inst_name', 'fneg'), repeat($.fast_math), $.type_and_value),

    instruction_bin_op: $ => seq(field('inst_name', $.bin_op_keyword),
      repeat(choice('nsw', 'nuw', 'exact', 'disjoint', $.fast_math)), $.type_and_value, ',', $.value),

    instruction_switch: $ => seq(field('inst_name', 'switch'), $.type_and_value, ',', $.type_and_value,
      '[', repeat(seq($.type_and_value, ',', $.type_and_value)), ']'),

    instruction_invoke: $ => seq(field('inst_name', 'invoke'), $._call_part, 'to',
      $.type_and_value, 'unwind', $.type_and_value),

    instruction_cleanupret: $ => seq(field('inst_name', 'cleanupret'), 'from', $.local_var, $._unwind_label),
    instruction_catchret: $ => seq(field('inst_name', 'catchret'), 'from', $.local_var, 'to', $.type_and_value),

    instruction_catchswitch: $ => seq(field('inst_name', 'catchswitch'), $._within, $._value_array, $._unwind_label),

    instruction_catchpad: $ => seq(field('inst_name', 'catchpad'), $._within, $._value_array),
    instruction_cleanuppad: $ => seq(field('inst_name', 'cleanuppad'), $._within, $._value_array),

    instruction_callbr: $ => seq(field('inst_name', 'callbr'), $._call_part, 'to',
      $.type_and_value, optional(seq('[', commaSep1($.type_and_value), ']'))),

    instruction_icmp: $ => seq(field('inst_name', 'icmp'), $.icmp_cond, $.type_and_value, ',', $.value),

    instruction_fcmp: $ => seq(field('inst_name', 'fcmp'), repeat($.fast_math), $.fcmp_cond, $.type_and_value, ',', $.value),

    instruction_cast: $ => seq(field('inst_name', $.cast_inst), optional('nneg'), $.type_and_value, 'to', $.type),

    instruction_va_arg: $ => seq(field('inst_name', 'va_arg'), $.type_and_value, ',', $.type),

    instruction_phi: $ => seq(field('inst_name', 'phi'), repeat($.fast_math),
      $.type, commaSep1(seq('[', $.value, ',', $.local_var, ']'))),

    instruction_landingpad: $ => seq(field('inst_name', 'landingpad'),
      $.type, choice($.landingpad_clause, 'cleanup'), repeat($.landingpad_clause)),

    instruction_call: $ => seq(optional(choice('tail', 'musttail', 'notail')), field('inst_name', 'call'),
      repeat($.fast_math), $._call_part),

    instruction_alloca: $ => seq(field('inst_name', 'alloca'), optional('inalloca'), optional('swifterror'),
      $.type, repeat(seq(',', choice($.type_and_value, $.alignment, $.addrspace)))),

    instruction_load: $ => seq(field('inst_name', 'load'), optional('atomic'), optional('volatile'),
      $.type, ',', $._load_store_suffix),

    instruction_store: $ => seq(field('inst_name', 'store'), optional('atomic'), optional('volatile'),
      $.type_and_value, ',', $._load_store_suffix),

    instruction_cmpxchg: $ => seq(field('inst_name', 'cmpxchg'), optional('weak'), optional('volatile'),
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value, optional($.syncscope),
      $.atomic_ordering, $.atomic_ordering, optional(seq(',', $.alignment))),

    instruction_atomicrmw: $ => seq(field('inst_name', 'atomicrmw'), optional('volatile'), $.atomic_bin_op_keyword,
      $.type_and_value, ',', $.type_and_value, optional($.syncscope), $.atomic_ordering, optional(seq(',', $.alignment))),

    instruction_fence: $ => seq(field('inst_name', 'fence'), optional($.syncscope), $.atomic_ordering),

    instruction_getelementptr: $ => seq(field('inst_name', 'getelementptr'), optional('inbounds'),
      commaSep1(seq(optional('inrange'), $.type_and_value))),

    instruction_extractvalue: $ => seq(field('inst_name', 'extractvalue'), $.type_and_value, ',', commaSep1($.number)),

    instruction_insertvalue: $ => seq(field('inst_name', 'insertvalue'), $.type_and_value, ',',
      $.type_and_value, ',', commaSep1($.number)),


    _call_part: $ => seq(
      optional($.calling_conv),
      repeat($.param_or_return_attrs),
      optional($.addrspace),
      $.type,
      field('callee', choice($.value, $.inline_asm)),
      field('arguments', $.argument_list),
      repeat($.attribute),
      optional($.operand_bundles),
    ),

    type_and_value: $ => choice(
      prec(1, seq('metadata', $.metadata)),
      seq(
        $.type,
        // Value is optional for void
        optional($.value),
      ),
    ),

    value: $ => choice(
      seq(repeat($.linkage), $.var),
      $._primitive_value,
      $.struct_value,
      $.packed_struct_value,
      $.array_value,
      $.vector_value,
      $.blockaddress,
      $.constant_expr,
    ),

    // single literals
    _primitive_value: $ => choice(
      'true',
      'false',
      'null',
      'none',
      'undef',
      'poison',
      'zeroinitializer',
      $.number,
      $.float,
      $.string,
      $.cstring,
    ),

    struct_value: $ => seq('{', commaSep($.type_and_value), '}'),
    packed_struct_value: $ => seq('<{', commaSep($.type_and_value), '}>'),
    array_value: $ => seq('[', commaSep($.type_and_value), ']'),
    vector_value: $ => seq('<', commaSep($.type_and_value), '>'),

    metadata_refs: $ => seq(
      ',',
      $.metadata_name,
      $.metadata,
    ),

    operand_bundles: $ => seq(
      '[',
      commaSep1(seq(
        $.string,
        '(',
        commaSep($.type_and_value),
        ')',
      )),
      ']',
    ),

    landingpad_clause: $ => seq(
      choice('catch', 'filter'),
      $.type_and_value,
    ),

    blockaddress: $ => seq(
      'blockaddress',
      '(',
      $.global_var,
      ',',
      $.local_var,
      ')',
    ),

    constant_expr: $ => choice(
      $.constant_cast,
      $.constant_getelementptr,
      $.constant_select,
      $.constant_icmp,
      $.constant_fcmp,
      $.constant_extractelement,
      $.constant_insertelement,
      $.constant_shufflevector,
      $.constant_extractvalue,
      $.constant_insertvalue,
      $.constant_fneg,
      $.constant_bin_op,
    ),

    constant_cast: $ => seq(
      field('inst_name', $.cast_inst),
      '(',
      $.type_and_value,
      'to',
      $.type,
      ')',
    ),

    constant_getelementptr: $ => seq(
      field('inst_name', 'getelementptr'),
      optional('inbounds'),
      optional(seq('inrange', '(', $.number, ',', $.number, ')')),
      '(',
      commaSep1(seq(optional('inrange'), $.type_and_value)),
      ')',
    ),

    constant_select: $ => seq(field('inst_name', 'select'), '(',
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value, ')'),

    constant_icmp: $ => seq(field('inst_name', 'icmp'), $.icmp_cond, '(',
      $.type_and_value, ',', $.type_and_value, ')'),

    constant_fcmp: $ => seq(field('inst_name', 'fcmp'), repeat($.fast_math), $.fcmp_cond, '(',
      $.type_and_value, ',', $.type_and_value, ')'),

    constant_extractelement: $ => seq(field('inst_name', 'extractelement'), '(',
      $.type_and_value, ',', $.type_and_value, ')'),
    constant_insertelement: $ => seq(field('inst_name', 'insertelement'), '(',
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value, ')'),
    constant_shufflevector: $ => seq(field('inst_name', 'shufflevector'), '(',
      $.type_and_value, ',', $.type_and_value, ',', $.type_and_value, ')'),
    constant_extractvalue: $ => seq(field('inst_name', 'extractvalue'), '(',
      $.type_and_value, ',', commaSep1($.number), ')'),
    constant_insertvalue: $ => seq(field('inst_name', 'insertvalue'), '(',
      $.type_and_value, ',', $.type_and_value, ',', commaSep1($.number), ')'),

    constant_fneg: $ => seq(field('inst_name', 'fneg'),
      repeat($.fast_math), '(', $.type_and_value, ')'),

    constant_bin_op: $ => seq(field('inst_name', $.bin_op_keyword),
      repeat(choice('nsw', 'nuw', 'exact', $.fast_math)), '(', $.type_and_value, ',', $.type_and_value, ')'),

    bin_op_keyword: $ => choice(
      $.atomic_bin_op_keyword,
      'mul',
      'urem',
      'srem',
      'shl',
      'udiv',
      'sdiv',
      'lshr',
      'ashr',
      'fmul',
      'fdiv',
      'frem',
    ),

    atomic_bin_op_keyword: $ => choice(
      'xchg',
      'add',
      'sub',
      'and',
      'nand',
      'or',
      'xor',
      'max',
      'min',
      'umax',
      'umin',
      'fadd',
      'fsub',
    ),

    icmp_cond: $ => choice('eq', 'ne', 'ugt', 'uge', 'ult', 'ule', 'sgt', 'sge', 'slt', 'sle'),
    fcmp_cond: $ => choice('false', 'oeq', 'ogt', 'oge', 'olt', 'ole', 'one', 'ord', 'ueq', 'ugt', 'uge', 'ult', 'ule', 'une', 'uno', 'true'),
    cast_inst: $ => choice('bitcast', 'trunc', 'zext', 'sext', 'fptrunc', 'fpext', 'addrspacecast', 'uitofp', 'sitofp', 'fptoui', 'fptosi', 'inttoptr', 'ptrtoint'),

    atomic_ordering: $ => choice('unordered', 'monotonic', 'acquire', 'release', 'acq_rel', 'seq_cst'),

    alignment: $ => seq(
      'align',
      $.number,
    ),

    _load_store_suffix: $ => seq(
      $.type_and_value,
      optional($.syncscope),
      optional($.atomic_ordering),
      optional(seq(',', 'align', $.number)),
    ),

    syncscope: $ => seq(
      'syncscope',
      '(',
      $.string,
      ')',
    ),

    fast_math: $ => choice(
      'nnan',
      'ninf',
      'nsz',
      'arcp',
      'contract',
      'afn',
      'reassoc',
      'fast',
    ),

    _value_array: $ => seq(
      '[',
      commaSep($.type_and_value),
      ']',
    ),

    _within: $ => seq(
      'within',
      choice('none', $.local_var),
    ),

    _unwind_label: $ => seq(
      'unwind',
      choice(seq('to', 'caller'), $.type_and_value),
    ),

    use_list_order: $ => seq(
      'uselistorder',
      $.type_and_value,
      ',',
      '{',
      commaSep($.number),
      '}',
    ),

    use_list_order_bb: $ => seq(
      'uselistorder_bb',
      $.global_var,
      ',',
      $.local_var,
      ',',
      '{',
      commaSep($.number),
      '}',
    ),

    module_asm: $ => seq(
      'module',
      'asm',
      $.asm,
    ),

    inline_asm: $ => seq(
      'asm',
      optional('sideeffect'),
      optional('alignstack'),
      optional('inteldialect'),
      optional('unwind'),
      $.asm,
      ',',
      $.string,
    ),

    asm: $ => $.string,

    global_type: $ => seq($.local_var, '=', 'type', $.type),

    _global_prefix: $ => seq(
      $.global_var, '=', repeat($.linkage), optional($.thread_local),
      optional($.unnamed_addr), optional($.addrspace), optional('externally_initialized'),
    ),

    global_global: $ => seq(
      $._global_prefix,
      choice('global', 'constant'), $.type_and_value,
      repeat(seq(optional(','), $.attribute)),
      repeat($.metadata_refs),
    ),

    alias: $ => seq(
      $._global_prefix,
      'alias', $.type, ',', optional($.type), choice($.global_var, $.constant_expr),
      repeat(seq(optional(','), $.attribute)),
      repeat($.metadata_refs),
    ),

    ifunc: $ => seq(
      $._global_prefix,
      'ifunc', $.type, ',', optional($.type), choice($.global_var, $.constant_expr),
      repeat(seq(optional(','), $.attribute)),
      repeat($.metadata_refs),
    ),

    thread_local: $ => seq(
      'thread_local',
      optional(seq(
        '(',
        choice('localdynamic', 'initialexec', 'localexec'),
        ')',
      )),
    ),

    comdat: $ => seq(
      $.comdat_ref,
      '=',
      'comdat',
      choice('any', 'exactmatch', 'largest', 'nodeduplicate', 'samesize'),
    ),

    global_metadata: $ => seq(
      $.metadata_ref,
      '=',
      optional('distinct'),
      $.metadata
    ),

    metadata: $ => choice(
      $.type_and_value,
      $.specialized_md,
      $.metadata_tuple,
      'null',
      seq('!', $.string),
    ),

    metadata_tuple: $ => seq(
      '!',
      token.immediate('{'),
      commaSep($.metadata),
      '}',
    ),

    specialized_md: $ => seq(
      $.metadata_ref,
      // Can be named md or specialized md
      optional(seq(
        token.immediate('('),
        repeat($.specialized_md_value),
        ')',
      )),
    ),

    specialized_md_value: $ => choice(
      /[-a-zA-Z0-9_.$\\]+/,
      '|',
      ':',
      ',',
      '*',
      $._primitive_value,
      $.var,
      $.type_keyword,
      $.addrspace,
      $.metadata_tuple,
      $.specialized_md,
      seq('{', repeat($.specialized_md_value), '}'),
      seq('(', repeat($.specialized_md_value), ')'),
      seq('[', repeat($.specialized_md_value), ']'),
      seq('<', repeat($.specialized_md_value), '>'),
    ),

    summary_entry: $ => seq(
      $.summary_ref,
      '=',
      field('name', /[-a-zA-Z0-9_.$\\]+/),
      ':',
      choice(
        seq('(', repeat($.summary_value), ')'),
        $.number,
        $.string,
        $.summary_ref,
      ),
    ),

    summary_value: $ => choice(
      /[-a-zA-Z0-9_.$\\]+/,
      ':',
      ',',
      $.attribute_name,
      $.string,
      $.number,
      $.summary_ref,
      $.linkage_aux,
      seq('[', repeat($.summary_value), ']'),
      seq('(', repeat($.summary_value), ')'),
    ),

    unnamed_attr_grp: $ => seq(
      'attributes',
      $.attr_ref,
      '=',
      '{',
      repeat($.attribute),
      '}',
    ),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function orSep(rule) {
  return optional(orSep1(rule));
}

function orSep1(rule) {
  return seq(rule, repeat(seq('|', rule)));
}
