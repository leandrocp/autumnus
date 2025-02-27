#include "nan.h"
#include "tree_sitter/parser.h"
#include <node.h>

using namespace v8;

extern "C" TSLanguage *tree_sitter_csv();
extern "C" TSLanguage *tree_sitter_psv();
extern "C" TSLanguage *tree_sitter_tsv();

namespace {

NAN_METHOD(New) {}

void Init(Local<Object> exports, Local<Object> module) {
    Local<FunctionTemplate> csv_tpl = Nan::New<FunctionTemplate>(New);
    csv_tpl->SetClassName(Nan::New("Language").ToLocalChecked());
    csv_tpl->InstanceTemplate()->SetInternalFieldCount(1);
    Local<Function> csv_constructor =
        Nan::GetFunction(csv_tpl).ToLocalChecked();
    Local<Object> csv_instance =
        csv_constructor->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
    Nan::SetInternalFieldPointer(csv_instance, 0, tree_sitter_csv());
    Nan::Set(csv_instance, Nan::New("name").ToLocalChecked(),
             Nan::New("csv").ToLocalChecked());

    Local<FunctionTemplate> psv_tpl = Nan::New<FunctionTemplate>(New);
    psv_tpl->SetClassName(Nan::New("Language").ToLocalChecked());
    psv_tpl->InstanceTemplate()->SetInternalFieldCount(1);
    Local<Function> psv_constructor =
        Nan::GetFunction(psv_tpl).ToLocalChecked();
    Local<Object> psv_instance =
        psv_constructor->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
    Nan::SetInternalFieldPointer(psv_instance, 0, tree_sitter_psv());
    Nan::Set(psv_instance, Nan::New("name").ToLocalChecked(),
             Nan::New("psv").ToLocalChecked());

    Local<FunctionTemplate> tsv_tpl = Nan::New<FunctionTemplate>(New);
    tsv_tpl->SetClassName(Nan::New("Language").ToLocalChecked());
    tsv_tpl->InstanceTemplate()->SetInternalFieldCount(1);
    Local<Function> tsv_constructor =
        Nan::GetFunction(tsv_tpl).ToLocalChecked();
    Local<Object> tsv_instance =
        tsv_constructor->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
    Nan::SetInternalFieldPointer(tsv_instance, 0, tree_sitter_tsv());
    Nan::Set(tsv_instance, Nan::New("name").ToLocalChecked(),
             Nan::New("tsv").ToLocalChecked());

    Nan::Set(exports, Nan::New("csv").ToLocalChecked(), csv_instance);
    Nan::Set(exports, Nan::New("psv").ToLocalChecked(), psv_instance);
    Nan::Set(exports, Nan::New("tsv").ToLocalChecked(), tsv_instance);
}

NODE_MODULE(tree_sitter_csv_binding, Init)

} // namespace
