import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,

    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UrlState } from '@/context';
import Button from './ui/button';
import Input from './ui/input';
import { Card } from './ui/card';
import Error from '@/components/error';
import * as yup from 'yup'
import { QRCode } from 'react-qrcode-logo';
import { createUrls } from '@/db/apiUrls';
import { BeatLoader } from 'react-spinners';
import useFetch from '@/hook/use-fetch';
import { useEffect } from 'react';


const CreateLink = ({ trigger, children }) => {
    const { user } = UrlState();
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();
    const longLink = searchParams.get("createNew");

    const ref = useRef();
    const [open, setOpen] = useState(Boolean(longLink));
    const [errors, setErrors] = useState({});
    const [formValues, setFormValues] = useState({
        title: "",
        longUrl: longLink ? longLink : "",
        customUrl: "",
        expires_at: "",
    })

    useEffect(() => {
        if (longLink) {
            setOpen(true);
            setFormValues((prev) => ({ ...prev, longUrl: longLink }));
        }
    }, [longLink]);

    const schema = yup.object().shape({
        title: yup.string().required("Title is required"),
        longUrl: yup.string().url("Must be a Valid URL").test(
            "http-https",
            "URL must use http or https",
            (value) => {
                if (!value) return true;
                try {
                    const protocol = new URL(value).protocol;
                    return protocol === "http:" || protocol === "https:";
                } catch {
                    return false;
                }
            }
        ).required("Long URL is required"),
        customUrl: yup.string().max(30, "Custom link must be 30 characters or fewer")
            .matches(/^[a-zA-Z0-9_-]*$/, "Use only letters, numbers, hyphens, and underscores")
            .test("reserved-route", "This custom link is reserved", (value) => {
                return !["auth", "dashboard", "link"].includes(value?.toLowerCase());
            }).optional(),
        expires_at: yup.string()
            .test("future-date", "Expiry date must be in the future", (value) => {
                if (!value) return true;
                return new Date(value) > new Date();
            })
            .optional(),
    })

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.id]: e.target.value,
        })
    }
    const {
        loading,
        error,
        fn: fnCreateUrl,
    } = useFetch(createUrls, { ...formValues, user_id: user?.id });

    const createNewLink = async () => {
        setErrors({});
        try {
            await schema.validate(formValues, { abortEarly: false });

            let blob = null;
            if (ref.current?.canvasRef?.current) {
                const canvas = ref.current.canvasRef.current;
                blob = await new Promise((resolve) => canvas.toBlob(resolve));
            }

            const res = await fnCreateUrl(blob);
            if (res && res[0]) {
                setOpen(false);
                setSearchParams({});
                setFormValues({
                    title: "",
                    longUrl: "",
                    customUrl: "",
                    expires_at: "",
                });
                setErrors({});
                navigate(`/link/${res[0].id}`);
            }
        } catch (e) {
            const newErrors = {};

            e?.inner?.forEach((err) => {
                newErrors[err.path] = err.message;
            });

            setErrors(newErrors);
        }
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSearchParams({});
            setErrors({});
            setFormValues({
                title: "",
                longUrl: "",
                customUrl: "",
                expires_at: "",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    trigger || children || (
                        <Button variant="destructive" className="bg-crisp-danger text-white hover:bg-[#B91C1C]">
                            Create New Link
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-md bg-[#0f172a] border border-slate-700/80 text-white rounded-2xl p-6 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="font-heading font-extrabold text-2xl text-white">Create New</DialogTitle>
                </DialogHeader>

                {formValues?.longUrl && (
                    <div className="flex justify-center p-3 bg-white rounded-xl w-fit mx-auto shadow-md">
                        <QRCode value={formValues.longUrl} size={200} ref={ref} />
                    </div>
                )}

                <Input
                    id="title"
                    placeholder="Short Link's Title"
                    value={formValues.title}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-700/80 bg-[#0F172A] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-300 transition"
                />
                {errors.title && <Error message={errors.title} />}

                <Input
                    id="longUrl"
                    placeholder="Enter your Looong URL"
                    value={formValues.longUrl}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-700/80 bg-[#0F172A] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-300 transition"
                />
                {errors.longUrl && <Error message={errors.longUrl} />}

                <div className="flex items-center gap-2">
                    <div className="h-11 px-4 rounded-xl border border-slate-700/80 bg-[#0F172A] text-sm font-medium text-slate-300 flex items-center justify-center shrink-0 select-none">
                        CrispURL
                    </div>
                    <span className="text-slate-400 font-bold text-lg select-none px-0.5">/</span>
                    <Input
                        id="customUrl"
                        placeholder="Custom link (Optional)"
                        value={formValues.customUrl}
                        onChange={handleChange}
                        className="h-11 flex-1 rounded-xl border border-slate-700/80 bg-[#0F172A] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-300 transition"
                    />
                </div>
                {errors.customUrl && <Error message={errors.customUrl} />}

                <div className="space-y-1">
                    <Input
                        id="expires_at"
                        type="datetime-local"
                        placeholder="Expires on (optional)"
                        value={formValues.expires_at}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-slate-700/80 bg-[#0F172A] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-300 transition [color-scheme:dark]"
                    />
                    <p className="text-xs text-slate-400">Leave empty for a link that never expires</p>
                    {errors.expires_at && <Error message={errors.expires_at} />}
                </div>

                <DialogFooter className="sm:justify-start -mx-0 -mb-0 p-0 border-t-0 bg-transparent pt-2">
                    <Button
                        type="button"
                        variant="destructive"
                        className="bg-[#d22020] hover:bg-[#B91C1C] text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition disabled:opacity-50"
                        onClick={createNewLink}
                        disabled={loading}
                    >
                        {loading ? <BeatLoader size={10} color='white' /> : "Create"}
                    </Button>
                </DialogFooter>

            </DialogContent>

        </Dialog>
    )
}

export default CreateLink
